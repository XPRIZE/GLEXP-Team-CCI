function Pubbly(data, runtimeProps) {
    const _Pubbly = this;
    // shared/mergeObjWithDefaults.js
    this.runtimeProps = mergeObjWithDefaults(
            runtimeProps,
            {
                // Stop the stupid ear splitting recordings we use
                masterVolume: 1,
                // Start 5 pages in book for targeted testing
                startPage: 0,
                // Show pages on the left and right of show window (overflow:visible)
                showOverflowPages: false,
                // Readout each target as it's hit in the sequence
                showSequence: false,
                // Print out the names of the objects being drawn on the page
                announceDrawnObjects: false,
                // Readout each image/audio as it's loaded in the buffer
                announceAssetLoad: false,
                // Artificial load time between assets in ms
                artificialLoadTime: 0,
                // Artificially set interrupts to "TRUE"
                artificialInterrupt: undefined,
                // Hold any open page [first time] links from playing (usually nav testing)
                holdPageLinks: false,
                // When you get to a matching TID, halt everything (look underhood at break point);
                stopAtTarget: "",
                // Draw 2px black line around field borders. For eyeball font sizing.
                drawFieldBorders: false,
                // Ambitious! Will playback at double or half speed depending
                // speedModified: 1
            });
    this.curPage = this.runtimeProps.startPage;
    this.frameRate = false;
    this.data = data; // CAREFUL to only access object prop, not the let arg as it will not garbage collect

    this.domInteraction = false;
    this.domInteractionNeeded = true;
    this.ready = false;
    this.init = function () {
        /*
         * NOPE not set here... Needs to be set in XML pre JSON save so INITs can carry.
         for (let p = 0; p < this.data.pages.length; p++) {
         // Array of page specific points that have been changed (by sequences) or checked (after sequence termination)
         // Set here cause setting in XML.js is messy
         this.data.pages[p].points.changed = [];
         }
         */

        this.lzwCompress = window.lzwCompress;
        this.dom = new PubblyDom(data);
        /*
         * {
         *      main: $("#pubbly_main"),
         *      textEntryHidden: $("#textEntryHidden"),
         * }
         */
        // Next/Prev nav buttons, goto drop down
        this.navigationUI = new NavigationUI({
            display: this.data.info.display,
            bookLength: this.data.pages.length,
            initShown: this.data.info.navigation,
            // domClickCover
            initEnabled: !(!this.domInteraction && this.domInteractionNeeded),
            startPage: this.curPage,
            lastPageSpread: this.data.info.lastPageSpread,
        }, this.dom.header);
        // Hidden, used for line width measurements (best fit text fields)
        this.textCtx = document.createElement("canvas").getContext('2d');
        // Page turning, single and double
        this.turns = new Turns(_Pubbly, this.data.info.display);
        // Clicks and touches
        this.events = new Events(_Pubbly);
        // Revert to previous save state
        this.states = new States(_Pubbly);
        // Done in states init
        // this.states.save();
        this.countdown = new Countdown(_Pubbly);
        // Sequencing, includes all player functions
        this.sequence = new Sequence(_Pubbly);
        // TODO: Load players seperate
        // this.players = whatever
        // UrlNav. Since it's a dirty word for modern browsers, cleaner to keep workarounds in their own obj
        this.urlNav = new UrlNav();
        /* Workspaces!
         Because I want pubbly.data to be props only, workspace elements are in a seperate area;
         The curObj.elem prop is a number reference to pubbly.workspaces[w], which is the element.
         For saving and loading, we can add curObj.data strings.
         */
        this.workspaces = new Workspaces(_Pubbly);
        // No longer. Fields done here, all XML props data only (no functions, easier for save states)
        // this.fields = new Fields(_Pubbly);

        // Default
        this.drawingTool = {
            type: "eraser",
            color: "RGBA(0,0,0,0)",
            width: 40,
        }

        // Keeps track of frame rate stuff that requires the page to redraw at a 24fps interval.
        // Ensures that, if two things require redraw ints, you don't set two seperate ints.
        this.redrawDependency = new RedrawDependency(this);
        // Preset assets (logo, arrows, stuff that's same every time) loading
        let domInteractionCovers = [
            "Bee_exit2.gif",
            "Bee_loop_fast.gif",
            "Mathazzar-Loading.gif",
            "bird_jump_loop2.gif",
            "word_pup_screen_gif_03.gif",
            "wordtopia5.gif",
        ];
        let cover = domInteractionCovers[rand(domInteractionCovers.length - 1)];
        this.presets = new PresetHandler([
            ["blackBoardBG", "image", "../shared/textures/blackBoardBG.png"],
            ["pencil-cursor", "image", "../shared/cursors/pencil.png"],
            ["chalk-cursor", "image", "../shared/cursors/chalk.png"],
            ["eraser-cursor", "image", "../shared/cursors/eraser.png"],
            ["pen-cursor", "image", "../shared/cursors/pen.png"],
            // TODO: Put other presets (logo and stuff) in this script. Works goodnstuff
            ["aud-blank", "audio", "../shared/audio/blank.mp3"],
            // Assets used to create progress graphs
            ["loader_letters_empty", "image", "../shared/logos/logoEmptyColors.png"],
            // Google doesn't allow autoplaying audio/video without DOM interaction first
            // TODO: Check if needed, write to JSON, fancy fancy.
            ["domInteractionCover", "image", "../shared/domInteractionCover/" + cover],
        ], function () {
            _Pubbly.progressGraph = new ProgressGraph("vertical_letters", _Pubbly.dom.main.find("#loaderCont"));
            // Asset loading and unloading.
            _Pubbly.buffer = new Buffer(_Pubbly, _Pubbly.data);
            _Pubbly.updatePage.call(_Pubbly);
        }); // LOC: presetAssets.js
    };
    this.drawPage = function (which, cb) {
        // Which can be a page number, or an array of page numbers
        if (typeof which === "object") {
            let drawn = 0;
            for (let w = 0; w < which.length; w++) {
                drawAct.call(this, which[w], function () {
                    drawn++;
                    if (drawn == which.length - 1 && cb) {
                        cb();
                    }
                });
            }
        } else {
            if (typeof which === "undefined") {
                which = this.curPage;
            }
            drawAct.call(this, which, cb);
        }
        function drawField(ctx, curObj, relPage) {
            let text = curObj.contents || ""; // Default is fixed text.
            if (curObj.displayType == "points") {
                let localCheck = this.data.pages[relPage].points[curObj.display];
                let globalCheck = this.data.points[curObj.display];
                text = (typeof localCheck == "undefined") ? globalCheck : localCheck;
                if (typeof text == "undefined") {
                    error("warn", "draw page", "Undefined points reference: " + curObj.display);
                } else {
                    text = text.toString();
                }
            } else if (curObj.displayType == "countdown") {
                text = this.countdown.at;
            }
            let lines = false;
            let drawTops = [];
            if (text !== "" || curObj.editing) {
                lines = text.toString().split('\n') || []; // To string for points
                let fakeText = !text;
                if (fakeText) {
                    lines = ["M"];
                }


                // IF the size of the thing changes, THEN you empty the size and recalculated.
                // This saves us from having to run time consuming measureText nonsense every redraw.
                let measureChar = "M";
                if (curObj.calculated.size || curObj.size !== "auto") {
                    ctx.font = curObj.size + "pt " + curObj.font;
                } else {
                    // Calculate the best fit font size for the given field dimentions
                    // Ping pong back and forth until one more px font size is too large and one less is too small.
                    // Reasonable starting guess
                    let widthLimit = parseInt(curObj.width / lines[0].length);
                    let curDirection = false,
                            lastDirection = false,
                            measured = 0;
                    do {
                        // RESET HERE ever time, otherwise you gets stucks
                        measured = 0;
                        ctx.font = widthLimit + "pt " + curObj.font;
                        for (let l = 0; l < lines.length; l++) {
                            measured = Math.max(
                                    ctx.measureText(lines[l]).width,
                                    measured);
                        }
                        if (measured > curObj.width) {
                            curDirection = -1
                        } else {
                            curDirection = 1;
                        }
                        // first time setting this
                        if (lastDirection === false) {
                            lastDirection = curDirection;
                        }

                        if (lastDirection !== curDirection) {
                            // Changed directions means we found the size
                            // If we overshot, undershoot
                            if (curDirection = -1) {
                                widthLimit--;
                            }
                            // If we undershot, then fine, that's what we want
                            curDirection = lastDirection = false;
                        } else {
                            widthLimit += curDirection;
                        }
                    } while (curDirection !== false);
                    // switch to "o" maybe later?
                    // For the sake of not blowing my brains out, we're using "M".width as a decent round about method for measuring height
                    let heightLimit = 0;
                    measured = 0;
                    // Maybe flip M and measure the widht of taht? Does measureText measure the thing as it is drawn on a temp canvas, or just do some sort of... fuck it

                    // Old books expect garbage.
                    // Therefore, true height font improvements make them look worse.
                    let garbage_adjustment = 0.7;
                    do {
                        heightLimit++;
                        ctx.font = heightLimit + "pt " + curObj.font;
                        measured = ctx.measureText(measureChar).width;
                    } while (measured < (curObj.height * garbage_adjustment) / lines.length);
                    heightLimit--;
                    curObj.calculated.size = Math.min(heightLimit, widthLimit);
                    // Now to get the ACTUAL measurements with whatever size we have
                }
                ctx.font = curObj.calculated.size + "pt " + curObj.font;
                let widestLine = 0;
                for (let l = 0; l < lines.length; l++) {
                    widestLine = Math.max(
                            ctx.measureText(lines[l]).width,
                            widestLine);
                }
                curObj.calculated.lineHeight = ctx.measureText(measureChar).width;
                curObj.calculated.widestLine = widestLine;
                if (curObj.align == "left") {
                    curObj.calculated.leftMargin = 0;
                } else if (curObj.align == "center") {
                    curObj.calculated.leftMargin = (curObj.width - widestLine) / 2;
                } else if (curObj.align == "right") {
                    curObj.calculated.leftMargin = curObj.width - widestLine;
                } else {
                    error("warn", "draw page", "Unknown text align of " + curObj.align);
                }

                if (fakeText) {
                    lines = [""];
                }
                let insert = {at: 0, line: 0, char: 0};
                if (curObj.editing) {
                    let top = curObj.loc[0];
                    let left = curObj.loc[1] + curObj.calculated.leftMargin;
                    let height = curObj.calculated.size;
                    insert = {
                        at: this.events.f.insertionPoint.at,
                        line: 0,
                        char: 0,
                    }
                    for (let i = 0; i < insert.at; i++) {
                        insert.char++;
                        if (insert.char > lines[insert.line].length) {
                            insert.char = 0;
                            insert.line++;
                        }
                    }
                }
                ctx.font = curObj.calculated.size + "pt " + curObj.font;
                ctx.fillStyle = curObj.color;
                let drawLeftBase = curObj.loc[1] + curObj.calculated.leftMargin;
                for (let l = 0; l < lines.length; l++) {
                    let drawLeft = drawLeftBase;
                    let drawTop = curObj.loc[0] + (curObj.calculated.lineHeight * (l + 1));
                    if (curObj.align == "center") {
                        // move every line over to middle
                        let width = ctx.measureText(lines[l]).width;
                        drawLeft += (curObj.calculated.widestLine / 2) - (width / 2);
                    } else if (curObj.align == "right") {
                        // move every line over to middle
                        let width = ctx.measureText(lines[l]).width;
                        drawLeft += curObj.calculated.widestLine - width;
                    }
                    drawTops.push(drawTop);
                    ctx.fillText(
                            lines[l],
                            drawLeft,
                            drawTop,
                            );
                    if (curObj.editing &&
                            this.events.f.insertionPoint.on &&
                            insert.line == l) {
                        let lineStr = lines[l].substring(0, insert.char);
                        let strWidth = ctx.measureText(lineStr).width;
                        let fontsFuckingSuck = drawTop + (curObj.calculated.lineHeight * 0.17);
                        ctx.beginPath();
                        ctx.moveTo(drawLeft + strWidth, fontsFuckingSuck - curObj.calculated.lineHeight);
                        ctx.lineTo(drawLeft + strWidth, fontsFuckingSuck);
                        ctx.stroke();
                    }
                }
            }

            if (this.runtimeProps.drawFieldBorders) {
                ctx.fillStyle = "black";
                ctx.beginPath();
                ctx.lineTo(curObj.loc[1], curObj.loc[0]);
                ctx.lineTo(curObj.loc[1] + curObj.width, curObj.loc[0]);
                ctx.lineTo(curObj.loc[1] + curObj.width, curObj.loc[0] + curObj.height);
                ctx.lineTo(curObj.loc[1], curObj.loc[0] + curObj.height);
                ctx.lineTo(curObj.loc[1], curObj.loc[0]);
                ctx.stroke();
            }

        }
        function drawImage(ctx, curObj) {
            let img;
            let fileName = (curObj.type == "sequence") ?
                    curObj.frames[curObj.at].fileName :
                    curObj.fileName;
            img = this.buffer.assets[fileName].elem;
            let objDesc = this.getRealObjDescription(curObj);
            if (img !== false) {
                ctx.globalAlpha = objDesc.opacity;
                let args = [
                    img, // Element to be drawn
                    // screw you drawImage, it's top left. IT HAS ALWAYS BEEN TOP LEFT.
                    parseInt(objDesc.left, 10),
                    parseInt(objDesc.top, 10),
                    parseInt(objDesc.width, 10),
                    parseInt(objDesc.height, 10),
                ];
                if (objDesc.angle) {
                    let objRad = objDesc.angle * 360 * (Math.PI / 180);
                    let halfWidth = objDesc.width / 2;
                    let halfHeight = objDesc.height / 2;
                    ctx.save();
                    ctx.translate(objDesc.left + halfWidth, objDesc.top + halfHeight);
                    ctx.rotate(objRad);
                    ctx.translate(-halfWidth, -halfHeight);
                    ctx.drawImage(img, 0, 0, objDesc.width, objDesc.height);
                    ctx.restore();
                } else {
                    ctx.drawImage.apply(ctx, args);
                }
                ctx.globalAlpha = 1;
            } else {
                error("fatal", "Canvas redraw", "Bad image: " + curObj.fileName);
            }
        }
        function drawLine(ctx, curLine) {
            ctx.beginPath();
            ctx.moveTo(curLine.start[0], curLine.start[1]);
            ctx.lineTo(curLine.end[0], curLine.end[1]);
            ctx.stroke();
        }
        function drawWorkspace(ctx, workspace) {
            if (workspace.bgTexture) {
                let pattern = ctx.createPattern(this.presets.blackBoardBG, 'repeat');
                ctx.rect(workspace.loc[1], workspace.loc[0], workspace.width, workspace.height);
                ctx.fillStyle = pattern;
                ctx.fill();
            }
            let wan = this.workspaces.elems[workspace.elem].elem;
            ctx.drawImage(wan, workspace.loc[1], workspace.loc[0]);
        }

        function drawAct(num, cb) {
            let canClass = false;
            if (num == this.curPage) {
                canClass = "current";
            } else if (num + 1 == this.curPage) {
                canClass = "previous";
            } else if (num - 1 == this.curPage) {
                canClass = "next";
            } else {
                error("warn", "Bad drawPage call", "Cannot draw any but the current, previous or next pages");
            }
            if (canClass) {
                // One any only. Because too lazy to pass can dimensions, which I need, for angled draw.
                let canCover = $("#canvases").find("div." + canClass)[0],
                        can = $("#canvases").find("canvas." + canClass)[0],
                        ctx = can.getContext("2d");
                ctx.width = can.width;
                ctx.height = can.height;
                ctx.imageSmoothingEnabled = false;
                // TODO: BTX, draw all, BTX to CTX for the GUPS
                // Clear can
                can.width = can.width;
                let layeredObjs = [];
                for (let o = 0; o < this.data.pages[num].objs.length; o++) {
                    let curObj = this.data.pages[num].objs[o];
                    layeredObjs.push({name: curObj.name, layer: curObj.layer});
                }
                layeredObjs.sort(function (a, b) {
                    return a.layer - b.layer;
                });
                for (let lo = 0; lo < layeredObjs.length; lo++) {
                    let curObj = this.data.pages[num].objs[this.data.pages[num].objKey[layeredObjs[lo].name]];
                    if (curObj.vis) {
                        if (curObj.type == "image" ||
                                curObj.type == "clone" ||
                                curObj.type == "sequence") {
                            if (this.runtimeProps.announceDrawnObjects) {
                                console.log("Drawing img: " + curObj.name);
                            }
                            drawImage.call(this, ctx, curObj);
                        } else if (curObj.type == "field") {
                            // Need to call with relative page number. Why?
                            // Some field display points, and points can be local
                            // To know values for local points, you have to know pagenum
                            if (this.runtimeProps.announceDrawnObjects) {
                                console.log("Drawing field: " + curObj.name);
                            }
                            drawField.call(this, ctx, curObj, num);
                        } else if (curObj.type == "gif") {
                            // Same as image
                            if (this.runtimeProps.announceDrawnObjects) {
                                console.log("Drawing gif: " + curObj.name);
                            }
                            drawImage.call(this, ctx, curObj);
                        } else if (curObj.type == "workspace") {
                            if (this.runtimeProps.announceDrawnObjects) {
                                console.log("Drawing gif: " + curObj.name);
                            }
                            drawWorkspace.call(this, ctx, curObj);
                        } else {
                            error("warm", "draw page", "Unknown object type: " + curObj.type + ". Skipping");
                        }
                    }
                }
                for (let l = 0; l < this.data.pages[num].links.length; l++) {
                    let curLnk = this.data.pages[num].links[l];
                    if (curLnk.drawing == "single"
                            || curLnk.drawing == "multiple") {
                        if (curLnk.lines) {
                            for (let ln = 0; ln < curLnk.lines.length; ln++) {
                                drawLine(ctx, curLnk.lines[ln]);
                            }
                        }
                    }
                }

                if (this.data.info.display == "composite") {
                    let pUnit = this.data.info.width;
                    let leftCover = $("#canvases").find("div." + canClass + "SpreadLeft")[0];
                    let leftCan = $("#canvases").find("canvas." + canClass + "SpreadLeft");
                    let ltx = leftCan[0].getContext("2d");
                    ltx.width = ltx.width;
                    ltx.drawImage(can, 0, 0);
                    leftCover.removeAttribute("style");
                    let rightCover = $("#canvases").find("div." + canClass + "SpreadRight")[0];
                    let rightCan = $("#canvases").find("canvas." + canClass + "SpreadRight");
                    let rtx = rightCan[0].getContext("2d");
                    rtx.width = rtx.width;
                    rtx.drawImage(can, pUnit * -1, 0);
                    rightCover.removeAttribute("style");
                }
            }
            if (cb) {
                cb();
            }
        }
    }

    this.drawLinks = function (which) {
        let ctx = $("canvas.current")[0].getContext('2d');
        let drawLinkAct = function (poly, ctx, colors = ["#000000", "#505050"]) {
            ctx.fillStyle = colors[0];
            if (poly && poly[0]) {
                ctx.beginPath();
                ctx.moveTo(poly[0][0], poly[0][1]);
                for (let p = 1; p < poly.length; p++) {
                    ctx.lineTo(poly[p][0], poly[p][1]);
                }
                ctx.fillStyle = colors[1];
                ctx.fill();
                ctx.closePath();
                ctx.stroke();
            } else {
                console.warn("Link had no points, moving on...");
        }
        };
        let links = this.data.pages[this.curPage].links;
        if (typeof which == 'number') {
            drawLinkAct(links[which].poly, ctx);
        } else {
            for (let g = 0; g < links.length; g++) {
                drawLinkAct(links[g].poly, ctx);
            }
        }
    };
    // When the page changes (or when the book first loads)
    this.updatePage = function (newPage) {
        // Set curPage
        if (typeof newPage == "undefined") {
            newPage = this.curPage;
        } else {
            this.curPage = newPage;
        }

        // Update goto and nav buttons
        this.navigationUI.update(newPage);
        // Change the width attribute on composite displays
        // ALSO, change the pubbly.events.offsets for proper hover/click location
        if (this.data.info.display == "composite") {
            //  NOTE: alreay done in prepTurn, BUT we're not always called from after a turn!!
            //   -- Sometimes we're called from goto change, sometimes (future?) from the load itself
            // So we need to double check and change all canvas widths to what they need to be on composite displays
            let canvasesAsCover = {
                previous: false,
                current: false,
                next: false,
            };
            // ALWAYS three pages on a composite
            if (this.curPage == 0
                    || (this.curPage == this.data.pages.length - 1 && !this.data.info.lastPageSpread)) {
                // First or last page
                canvasesAsCover.current = true;
                this.events.offsets.pageOffsetX = this.data.info.width / -2;
            } else {
                this.events.offsets.pageOffsetX = 0;
            }

            if (this.curPage == 1) {
                // Previous page front cover
                canvasesAsCover.previous = true;
            }
            // SOMETIMES, ONLY three pages... Hence double if and not else if
            if (this.curPage + 1 == this.data.pages.length - 1 && !this.data.info.lastPageSpread) {
                // Next page rear cover
                canvasesAsCover.next = true;
            }

            for (let canName in canvasesAsCover) {
                let placer = this.dom.canPlacers[canName]
                let can = placer.find("canvas");
                let isCover = canvasesAsCover[canName];
                if (isCover) {
                    can.attr("width", this.data.info.width);
                    placer.addClass("cover");
                } else {
                    can.attr("width", this.data.info.width * 2);
                    placer.removeClass("cover");
                }
            }
            // No need to set canvas width for any other canvas
            // BECAUSE if composite, the spreadLeft and spreadRight canvases never change dimensions
            //
            //
            // OK for page 1 (spread) we want prev:600, cur:1200, next:1200
            // BUT ON GOTO we get             prev:
        }

        // 

        // Figure out which pages need to be loaded.
        //  If we're missing any critical 3 (prev, cur, next), we need to halt for a progress graph
        //    -- WHICH WILL LOAD 4 pages (prev, cur, next, next-next) to maintain the lead
        //  If we're ONLY missing the next-next page, buffer in background, start the show.
        let pages = [];
        let assetCount = 0;
        let haltForProgress = false;
        // Load three ahead!
        function hasXML(page) {
            return _Pubbly.data.pages[page]
        }
        function assetsLoaded(page) {
            return _Pubbly.buffer.pages[page].loaded;
        }
        for (let i = 0; i < 3; i++) {
            if (hasXML(this.curPage + i)) {
                if (assetsLoaded(this.curPage + i)) {
                    if (i == 0) {
                        this.drawPage();
                        this.restyleCanPlacers();
                    }
                } else {
                    pages.push(this.curPage + i);
                    assetCount += this.buffer.pages[this.curPage + i].assets.length
                    // If everything except page 2+ has assets, buffer in background
                    if (i < 2) {
                        haltForProgress = true;
                    }
                }
            }
        }
        if (hasXML(this.curPage - 1) &&
                !assetsLoaded(this.curPage - 1)) {
            pages.push(this.curPage - 1);
            assetCount += this.buffer.pages[this.curPage - 1].assets.length
            haltForProgress = true;
        }
        if (haltForProgress) {
            // buffer needed pages
            // callback to 

            // BOOY that would be nice right? TODO: 
            // this.ui.disable();
            this.progressGraph.blindCalculatePrep(assetCount);
            this.progressGraph.show();
            this.buffer.load(pages, function () {
                _Pubbly.progressGraph.end(function () {
                    //  _Pubbly.ready = true;
                    _Pubbly.initiatePage.call(_Pubbly);
                });
            });
        } else {
            // buffer next-next page in background
            this.initiatePage();
            this.progressGraph.blindCalculatePrep(assetCount);
            this.buffer.load(pages, function () {
                // Nothing... We've maintained the lead
            });
        }
    }
    this.restyleCanPlacers = function () {
        // Restyle
        for (let placer in this.dom.canPlacers) {
            if (this.dom.canPlacers[placer][0]) {
                this.dom.canPlacers[placer][0].removeAttribute("style");
            }
        }
    }
    // Called after a turn to make the .next canvas the .current one, or stuff like that.
    this.setCanvasClasses = function (curPage) {
        // curPage can now be a different number than the actual, which means I can call from TURN to set the cover shit for the page I'm about to change to.
        if (curPage == null) {
            curPage = this.curPage;
        }
        if (this.data.info.display == "composite") {
            if (curPage == 0 || (curPage == this.data.pages.length - 1 && !this.data.info.lastPageSpread)) {
                this.events.pageOffsetX = this.data.info.width / -2;
            } else {
                this.events.pageOffsetX = 0;
            }

            $("#pubbly_main #canvases .cover").find("canvas").attr("width", this.data.info.width * 2);
            $("#pubbly_main #canvases .cover").removeClass("cover");
            if (curPage == 0) {
                $("#pubbly_main #canvases .current").addClass("cover");
                $("#pubbly_main #canvases .current").find("canvas").attr("width", this.data.info.width);
            } else if (curPage == 1) {
                $("#pubbly_main #canvases .previous").addClass("cover");
                $("#pubbly_main #canvases .previous").find("canvas").attr("width", this.data.info.width);
            }
            if (curPage + 1 == this.data.pages.length && !this.data.info.lastPageSpread) {
                $("#pubbly_main #canvases .current").addClass("cover");
                $("#pubbly_main #canvases .current").find("canvas").attr("width", this.data.info.width);
            } else if (curPage + 2 == this.data.pages.length && !this.data.info.lastPageSpread) {
                $("#pubbly_main #canvases .next").addClass("cover");
                $("#pubbly_main #canvases .next").find("canvas").attr("width", this.data.info.width);
            }
        }
    }

    // 
    this.initiatePage = function () {
        function initiateAct() {
            _Pubbly.domInteraction = true;
            _Pubbly.ready = true;
            _Pubbly.restyleCanPlacers();
            _Pubbly.drawPage();
            if (_Pubbly.data.info.navigation) {
                _Pubbly.navigationUI.enable();
            }
            if (!_Pubbly.runtimeProps.holdPageLinks) {
                _Pubbly.checkPageFor("openPages");
            }
        }

        if (!this.domInteraction && this.domInteractionNeeded) {
            this.domInteractionCover = new DomInteractionCover(
                    this.dom.canvases,
                    this.presets.domInteractionCover,
                    initiateAct
                    );
        } else {
            initiateAct();
        }
    }

    this.checkLocFor = function (loc, what, condition) {
        // Template for found arr
        // found[0] = {
        //  link:this.data.pages[0].links[0],
        //  action:"click",
        //  loc:1
        // }

        // What options:
        //   clicks, dragStarts, dragStops, lineStarts, lineStops, editableFields
        if (typeof what !== "object") {
            what = [what];
        }
        let found = [];
        for (let l = 0; l < this.data.pages[this.curPage].links.length; l++) {
            let link = this.data.pages[this.curPage].links[l];
            if (link.enabled && inside(loc, link.poly)) {
                for (let w = 0; w < what.length; w++) {
                    let linkType = what[w];
                    if (linkType == "clicks"
                            || linkType == "dragStops"
                            || linkType == "lineStops") {
                        for (let i = 0; i < link.triggers[linkType].length; i++) {
                            let accepts = link.triggers[linkType][i].condition;
                            if (accepts == condition
                                    || accepts == "any" // TODO: XML Any to any
                                    || linkType == "clicks") {
                                found.push({
                                    link: link,
                                    type: "sequence",
                                    action: linkType,
                                    loc: i,
                                });
                            }
                        }
                    } else if (linkType == "lineStarts") {
                        if (link.drawing == "multiple" || link.drawing == "single") {
                            found.push({
                                link: link,
                                type: "singleAction",
                                action: link.drawing,
                                loc: null,
                            });
                        }
                    } else if (linkType == "dragStarts") {
                        // NOT HERE< moved to checkDrag || checkDraw || checkEdit conditional below
                    }
                }
            }
        }
        let checkDrag = what.indexOf("dragStarts") !== -1,
                checkDraw = what.indexOf("drawStarts") !== -1,
                checkEdit = what.indexOf("editableFields") !== -1;
        if (checkDrag || checkDraw || checkEdit) {
            for (let o = 0; o < this.data.pages[this.curPage].objs.length; o++) {
                let obj = this.data.pages[this.curPage].objs[o];
                if (checkDraw
                        && obj.type == "workspace"
                        && inside(loc, obj.rect)) {
                    found.push({
                        link: obj,
                        action: "draw",
                        loc: o,
                    });
                }

                if (
                        (checkDrag && (obj.mobility == "clone" || obj.mobility == "drag")) ||
                        (checkEdit && obj.type == "field" && obj.editable)) {
                    // Why not account for offsets? Because we don't want kids "catching" a dropped object while it animates back to position
                    let objTop = (obj.droppedLoc) ? obj.droppedLoc[0] : obj.loc[0];
                    let objLeft = (obj.droppedLoc) ? obj.droppedLoc[1] : obj.loc[1];
                    // Maybe give every obj a rect in the xml interpret part??
                    let rect = [
                        [objLeft, objTop],
                        [objLeft + obj.width, objTop],
                        [objLeft + obj.width, objTop + obj.height],
                        [objLeft, objTop + obj.height],
                    ];
                    // Drag, clone or editText
                    // TODO: This checks inside bounding rect. DOES NOT check for transparency in image.
                    // EXAMPLE: Three circles on top of eachother. You choose the one behind the one in front, but you're still in the transparent rect of the front most circle. Cursor on green, within the blue circle's bounding rect. Start dragging blue. Prob bob.
                    let action = (obj.mobility == "fixed") ? "editText" : obj.mobility;
                    if (inside(loc, rect)) {
                        found.push({
                            link: obj,
                            type: "singleAction",
                            action: action,
                            loc: o,
                        });
                    }
                }
            }
        }
        found.sort(function (a, b) {
            if (a.link.layer && b.link.layer) {
                return b.link.layer - a.link.layer;
            }
        });
        return found;
    }
    this.checkPageFor = function (what) {
        let links = this.data.pages[this.curPage].links;
        let points = this.data.pages[this.curPage].points;
        let totLinks = [];
        for (let l = 0; l < links.length; l++) {
            let link = links[l];
            let triggers = link.triggers[what];
            for (let p = 0; p < triggers.length; p++) {
                let trigger = triggers[p];
                if (what === "openPages") {
                    if (trigger.condition === "every" || trigger.run === 0) {
                        totLinks.push([{
                                action: "openPages",
                                loc: p,
                                link: link
                            }, trigger]);
                    }
                } else if (what == "countdowns") {
                    totLinks.push([{
                            action: "countdowns",
                            loc: p,
                            link: link
                        }, trigger]);
                } else if (what == "points") {
                    if (points.changed.indexOf(trigger.condition[0]) !== -1) {
                        let met = false;
                        let realPoints = (1 * points[trigger.condition[0]]);
                        let triggerPoints = (1 * trigger.condition[2]);
                        switch (trigger.condition[1]) {
                            case "<":
                                met = realPoints < triggerPoints;
                                break;
                            case "<=":
                                met = (realPoints <= triggerPoints);
                                break;
                            case ">":
                                met = (realPoints > triggerPoints);
                                break;
                            case ">=":
                                met = (realPoints >= triggerPoints);
                                break;
                            case "=":
                                met = (realPoints == triggerPoints);
                                break;
                            case "!=":
                                met = (realPoints !== triggerPoints);
                                break;
                            default:
                                console.error("Unknown point trigger comparison of "
                                        + trigger.condition[1]);
                                break;
                        }
                        if (met) {
                            totLinks.push([{
                                    action: "points",
                                    loc: p,
                                    link: link
                                }, trigger]);
                        }
                    }
                } else {
                    console.error("Unknown page trigger " + what);
                }
            }
        }
        // If multiple? Don't worry. Do one, then you'll check back here again. Do the next one.
        // Hopefully the links disable themselves en route so they don't loop back forever.
        if (totLinks[0]) {
            if (what == "points") {
                // Flag each point's changed prop as false
                // Because, since we're running the sequence
                // The change has been accounted for.
                let pointName = totLinks[0][1].condition[0];
                let p = this.data.pages[this.curPage].points.changed.indexOf(pointName);
                this.data.pages[this.curPage].points.changed.splice(p, 1);
            }

            this.sequence.startNew(totLinks[0][0], totLinks[0][1]);
        }
    };
//    this.checkPageLinks = function () {
//        this.checkPageFor("openPages");
//    };

    this.findObj = function (name, page) {
        // TODO: Combine with findLink into findGeneric, swap out "obj" and "link" for a let
        // _Pubbly cause screw scoped calls
        if (typeof page === "undefined") {
            page = _Pubbly.curPage;
        }
        let obj = false;
        let pageXML = _Pubbly.data.pages[page];
        if (pageXML) {
            let objKey = pageXML.objKey[name];
            // falsywalsy
            if (typeof objKey === "number") {
                obj = pageXML.objs[objKey];
            }
        }
        return obj;
    }
    this.getRealObjDescription = function (curObj) {
        let objTop = (curObj.swapMethod == "loc") ?
                curObj.loc[0] + (curObj.height - curObj.swapHeight) / 2 :
                curObj.loc[0];
        let objLeft = (curObj.swapMethod == "loc") ?
                curObj.loc[1] + (curObj.width - curObj.swapWidth) / 2 :
                curObj.loc[1];
        let objWidth = (curObj.swapMethod == "loc") ?
                curObj.swapWidth : curObj.width;
        let objHeight = (curObj.swapMethod == "loc") ?
                curObj.swapHeight : curObj.height;
        let objOpacity = curObj.opacity;
        let objAngle = curObj.angle || 0;
        // TODO: Figure out what happens when you animate a dropped object, then attempt to redrop in a bad spot. Does it go to it's last good drop? Or does it reset to it's home position.
        if (curObj.animations.playing) {
            // Height/width values for animations are relative to the objs init props.
            objWidth = (curObj.swapMethod == "loc") ?
                    curObj.swapWidth : curObj.init.width;
            objHeight = (curObj.swapMethod == "loc") ?
                    curObj.swapHeight : curObj.init.height;
            let anim = curObj.animations[curObj.animations.playing];
            // PICKUP: We can get the current animation leg from a math.floor. We can calculate the rest of the props from how far into that leg we've gotten. After anim is finished (back in player), we need to set the last leg anim props as current props (i.e., do it all again.
            let leg = -1, time = 0;
            do {
                leg++;
                time += anim.data[leg].time;
            } while (time < curObj.animations.at);
            let curLeg = anim.data[leg];
            let nextLeg = anim.data[leg + 1];
            let leftover = (time - curObj.animations.at);
            let percent = (curLeg.time - leftover) / curLeg.time;
            /* Function stored in helper.js
             function animLegNextByPercent(cur, next, percent) {
             return cur + ((next - cur) * percent);
             }
             */
            objTop = animLegNextByPercent(curLeg.loc[0], nextLeg.loc[0], percent);
            objLeft = animLegNextByPercent(curLeg.loc[1], nextLeg.loc[1], percent);
            objAngle = animLegNextByPercent(curLeg.angle, nextLeg.angle, percent);
            objOpacity = animLegNextByPercent(curLeg.opacity, nextLeg.opacity, percent);
            let heightMult = animLegNextByPercent(curLeg.height, nextLeg.height, percent);
            let widthMult = animLegNextByPercent(curLeg.width, nextLeg.width, percent);
            objHeight = objHeight * heightMult;
            objWidth = objWidth * widthMult;
            objTop -= objHeight / 2;
            objLeft -= objWidth / 2;
        } else if (curObj.droppedLoc) {
            objTop = curObj.droppedLoc[0];
            objLeft = curObj.droppedLoc[1];
        }
        if (curObj.offsets) {
            objTop += curObj.offsets[0];
            objLeft += curObj.offsets[1];
        }
        let ret = {
            top: objTop,
            left: objLeft,
            height: objHeight,
            width: objWidth,
            angle: objAngle,
            opacity: objOpacity,
            layer: curObj.layer,
        };
        return ret;
    };
    this.findLink = function (name, page) {
        // _Pubbly cause screw scoped calls
        if (typeof page === "undefined") {
            page = _Pubbly.curPage;
        }
        let link = false;
        let pageXML = _Pubbly.data.pages[page];
        if (pageXML) {
            let linkKey = pageXML.linkKeys[name];
            if (typeof linkKey == "number") {
                link = pageXML.links[linkKey];
            }
        }
        return link;
    }


    this.makeClone = function (parent) {
        let clone = jQuery.extend(true, {}, parent);
        console.log(clone);
        clone.type = "clone";
        clone.mobility = "drag";
        this.data.pages[this.curPage].objs.push(clone);
        return clone;
    }
    this.clearClones = function () {
        let objs = this.data.pages[this.curPage].objs;
        for (let o = 0; o < objs.length; o++) {
            let obj = objs[o];
            if (obj.type == "clone" && obj.markedForDeletion) {
                this.data.pages[this.curPage].objs.splice(o, 1);
                o--;
            }
        }
    }
    this.clearLines = function () {
        let lnks = this.data.pages[this.curPage].links
        for (let l = 0; l < lnks.length; l++) {
            let lnk = lnks[l];
            if (lnk.lines && lnk.lines.length) {
                for (let ln = 0; ln < lnk.lines.length; ln++) {
                    if (lnk.lines[ln].markedForDeletion) {
                        this.data.pages[this.curPage].links[l].lines.splice(ln, 1);
                        ln--;
                    }
                }
            }
        }
    }

    this.sendToTop = function (objName) {
        let page = this.data.pages[this.curPage];
        let obj = page.objs[page.objKey[objName]];
        let origLayer = obj.layer;
        obj.layer = page.objs.length;
        page.objs.forEach(function (obj) {
            if (obj.layer > origLayer) {
                obj.layer--;
            }
        });
        this.drawPage();
    }

    this.reset = function (type, loc) {
        if (type == "page") {
            loc = (typeof loc == "undefined") ? this.curPage : loc;
            let page = this.data.pages[loc];
            for (let o = 0; o < page.objs.length; o++) {
                let obj = page.objs[o];
                for (let prop in obj.init) {
                    obj[prop] = cutLink(obj.init[prop]);
                }
                obj.at = (typeof obj.at == "undefined") ? null : 0;
            }
            for (let l = 0; l < page.links.length; l++) {
                let link = page.links[l];
                for (let prop in link.init) {
                    link[prop] = cutLink(link.init[prop]);
                }
                for (let tt in link.triggers) {
                    let trigger = link.triggers[tt];
                    for (let t = 0; t < trigger.length; t++) {
                        trigger[t].run = 0;
                    }
                }
            }
        }
    }

    this.init();
}

function RedrawDependency(pubblyScope) {
    const _This = this, _Pubbly = pubblyScope;
    this.depList = [];
    this.add = function (what) {
        _This.depList.push(what);
        if (!this.interval) {
            _Pubbly.frameRate = 10;
            this.interval = window.setInterval(function () {
                _Pubbly.drawPage.call(_Pubbly);
            }, 10);
        }
    }
    this.remove = function (what) {
        for (let d = 0; d < _This.depList.length; d++) {
            if (_This.depList[d] == what) {
                _This.depList.splice(d, 1);
                d--;
            }
        }
        if (_This.depList.length == 0) {
            _Pubbly.frameRate = false;
            window.clearInterval(this.interval);
            this.interval = false;
            _Pubbly.drawPage.call(_Pubbly); // Last for good measure
            // This actually serves a purpose... It's redraws the final frame of an animation
        }
    }
    this.interval = false;
}


function cutLink(val) {
    switch (typeof val) {
        case "string":
            return val + "";
            break;
        case "number":
            return val * 1;
            break;
        case "undefined":
            return undefined;
            break;
        case "null":
            return null;
            break;
        case "array":
            return val.slice();
            break;
        case "object":
            // NOPE. Because typeof new Array is FUCKING OBJECT
            if (Array.isArray(val)) {
                return val.slice();
            } else {
                return jQuery.extend(true, {}, val);
            }
            break;
        case "boolean":
            return val == true;
            break;
    }
}
