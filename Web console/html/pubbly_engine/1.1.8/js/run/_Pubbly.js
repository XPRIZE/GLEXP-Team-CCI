class Pubbly {

    drawLinks(ctx, which, color) {
        let drawLinkAct = function (poly, ctx, color = "RGBA(20,20,20,0.2)") {
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            if (poly && poly[0]) {
                ctx.beginPath();
                ctx.moveTo(poly[0][0], poly[0][1]);
                for (let p = 1; p < poly.length; p++) {
                    ctx.lineTo(poly[p][0], poly[p][1]);
                }
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
                drawLinkAct(links[g].poly, ctx, color);
            }
        }
    }
// When the page changes (or when the book first loads)





// Called after a turn to make the .next canvas the .current one, or stuff like that.
    setCanvasClasses(curPage) {
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

    checkLocFor(loc, what, condition) {
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
            let poly = link.poly;
            let pinnedPoly = false;
            if (link.pinned) {
                let obj = this.data.pages[this.curPage].objs.find(o => o.name === link.pinned);
                if (obj) {
                    let info = this.getRealObjDescription(obj);
                    let topDif = info.top - obj.init.loc[0];
                    let leftDif = info.left - obj.init.loc[1];
                    pinnedPoly = poly.map(pt => {
                        return [pt[0] + leftDif, pt[1] + topDif];
                    });
                }
            }
            if (link.enabled && inside(loc, pinnedPoly || poly)) {
                for (let w = 0; w < what.length; w++) {
                    let linkType = what[w];
                    if (linkType === "clicks"
                            || linkType === "dragStops"
                            || linkType === "lineStops") {
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
                    } else if (linkType === "lineStarts") {
                        if (link.drawing == "multiple" || link.drawing == "single") {
                            found.push({
                                link: link,
                                type: "singleAction",
                                action: link.drawing,
                                loc: null,
                            });
                        }
                    } else if (linkType === "dragStarts") {
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
                        && obj.type === "workspace"
                        && obj.vis
                        && inside(loc, obj.rect)) {
                    found.push({
                        link: obj,
                        action: this.drawingTools.tool.cursor,
                        loc: o,
                    });
                }

                if (
                        (checkDrag && (obj.mobility === "clone" || obj.mobility === "drag")) ||
                        (checkEdit && obj.type === "field" && obj.editable)) {
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
                    if (inside(loc, rect)
                            // Invisible objects are not draggable
                            && obj.vis === true) {
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
// Move workspaces behind all links (so that you can safe zone shit)
            if (a.link.type === "workspace" || b.link.type === "workspace") {
                return (a.link.type === "workspace") ? 1 : -1;
            } else {
                return b.link.layer - a.link.layer;
            }
        });
        return found;
    }

    checkPageFor(what) {
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
                        if (!this.runtimeProps.holdPageLinks) {
                            totLinks.push([{
                                    action: "openPages",
                                    loc: p,
                                    link: link
                                }, trigger]);
                        }
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
    }

    getRealObjDescription(curObj) {
        // MAX height/width to the objHeightWidth for swapped.
        let objTop, objLeft, objWidth, objHeight, swapHeight, swapWidth;
        // Combined, never swapping for just size, always swapping for loc.
        if (curObj.swapMethod) {
            let heightOverage = curObj.swapHeight / curObj.height;
            let widthOverage = curObj.swapWidth / curObj.width;
            let scaleDown = Math.max(heightOverage, widthOverage, 1);
            swapHeight = curObj.swapHeight / scaleDown;
            swapWidth = curObj.swapWidth / scaleDown;
        }
        objTop = (curObj.swapMethod) ?
                curObj.loc[0] + (curObj.height - swapHeight) / 2 :
                curObj.loc[0];
        objLeft = (curObj.swapMethod) ?
                curObj.loc[1] + (curObj.width - swapWidth) / 2 :
                curObj.loc[1];
        objWidth = (curObj.swapMethod) ?
                swapWidth :
                curObj.width;
        objHeight = (curObj.swapMethod) ?
                swapHeight :
                curObj.height;

        let objOpacity = curObj.opacity;
        let objAngle = curObj.angle || 0;
        // TODO: Figure out what happens when you animate a dropped object, then attempt to redrop in a bad spot. Does it go to it's last good drop? Or does it reset to it's home position.
        if (curObj.animations.playing) {
// Height/width values for animations are relative to the objs init props.
            objWidth = (curObj.swapMethod) ?
                    swapWidth : curObj.init.width;
            objHeight = (curObj.swapMethod) ?
                    swapHeight : curObj.init.height;
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
            vis: curObj.vis,
        };
        return ret;
    }

    makeClone(parent) {
        let clone = jQuery.extend(true, {}, parent);
        clone.type = "clone";
        clone.mobility = "drag";
        // These two lines force a deletion on reset.
        clone.markedForDeletion = false;
        clone.init.markedForDeletion = true;
        this.data.pages[this.curPage].objs.push(clone);
        return clone;
    }
    clearClones() {
        let objs = this.data.pages[this.curPage].objs;
        for (let o = 0; o < objs.length; o++) {
            let obj = objs[o];
            if (obj.type === "clone" && obj.markedForDeletion) {
                this.data.pages[this.curPage].objs.splice(o, 1);
                o--;
            }
        }
    }
    clearLines() {
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

    /*
     reset(type, loc) {
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
     */

    fatalError(message) {
        console.error("Pubbly fatal error: " + message)
    }

// Garbage line
// I'm proud of everything below here.


// Calls:
// -- find(this.data.pages[0].objs[0])
// -- find("Ball_1", "image")
// -- find("Link 1", "link", 2)
    find(what, type, curPage) {
        let found = this.findAll(what, type, curPage);
        return (found[0]) ? found[0] : found;
    }
    sendToTop(what, type, curPage) {
        return this.sendTo(what, type, curPage, "top");
    }
    sendToBottom(what, type, curPage) {
        return this.sendTo(what, type, curPage, "bottom");
    }

    findAll(what, type = what.type, curPage = this.curPage) {
        let page = this.data.pages[curPage];
        let searchStart = false;
        let found = false;
        if (["image", "clone", "gif", "field", "workspace", "object", "video"].indexOf(type) >= 0) {
            searchStart = page.objs;
        } else if (["link"].indexOf(type) >= 0) {
            searchStart = page.links;
        }
        if (searchStart) {
            found = searchStart.filter(o => {
                if (typeof what === "object") {
// (this.data.pages[0].objs[0])
                    return (o === what);
                } else if (typeof what === "string") {
// ("ball 1", "clone")
// ("ball 1", "object") -- return first object, reguardless of type
                    return (o.name === what &&
                            (o.type === type || type === "object"));
                }
            });
        } else {
// Couldn't figure out where to start the search
        }
        return found;
    }

// Private
    sendTo(what, type = what.type, curPage = this.curPage, where) {
        let page = this.data.pages[curPage];
        let searchStart = false;
        let toSend = this.find(what, type, curPage);
        if (["image", "clone", "gif", "field", "workspace", "object"].indexOf(type) >= 0) {
            searchStart = page.objs;
        } else if (["link"].indexOf(type) >= 0) {
            searchStart = page.links;
        }
        if (searchStart && toSend) {
// searchStart is {a: 0, b:1, c:2, d:3}
            let origLayer = toSend.layer; // 1;
            if (where === "top") {
                toSend.layer = searchStart.length;
            } else {
                toSend.layer = -1;
                searchStart.map(o => o.layer++);
            }
// searchStart could now have gaps.
// {a: 0, b:1, c:4, d:5}
// Close gaps, keep relative order.
            searchStart = searchStart.sort((a, b) => a.layer - b.layer);
            searchStart.map((o, i) => o.layer = i);
            this.drawPage_dispatch();
            return toSend;
        } else {
// Couldn't find what to send or where it was.
        }
        return false;
    }

// Do we have enough loaded to draw the current page? 
// [prev, cur, next]
    getPageArrayNeededForDrawPage(checkPage = this.curPage) {
        let arr = [];
        arr.push(checkPage);
        // Next page first, second most important (probably going forwards)
        if (checkPage + 1 < this.data.pages.length) {
            arr.push(checkPage + 1);
        }
// Prev page next, third most important
        if (checkPage - 1 >= 0) {
            arr.push(checkPage - 1);
        }
        return arr;
    }
// Do we have enough loaded to maintain a comfortable lead?? 
// [prev, cur, next, next+1]
    getPageArrayNeededForBufferLead(checkPage = this.curPage) {
        let arr = this.getPageArrayNeededForDrawPage(checkPage);
        if (checkPage + 2 < this.data.pages.length) {
            arr.push(checkPage + 2);
        }
        return arr;
    }

    loadBufferLead(newPage, cbs) {
        let neededForDraw = this.getPageArrayNeededForDrawPage(newPage);
        let neededForLead = this.getPageArrayNeededForBufferLead(newPage);
        let missingForDraw = neededForDraw.reduce(
                function (a, p) {
                    let miss = this.pageBuffer.getPageUnloadedAssetCount(p);
                    return a + miss;
                }.bind(this), 0);
        if (missingForDraw === 0) {
// Buffer in background
            cbs.done();
            this.pageBuffer.loadMultiplePages(neededForLead);
        } else {
// Buffer in foreground
            this.pageBuffer.loadMultiplePages(neededForLead, {
                done: cbs.done,
                fail: cbs.fail,
                prog: cbs.prog,
            });
        }
    }
    getLastPage() {
        return this.data.pages.length - 1;
    }
    getLastPageSpread() {
        return this.data.info.lastPageSpread;
    }

    updateCanvasAttrsWithNewPageValues(newPage = this.curPage) {
        this.removeTurningStylesFromCanvases();
        // Change the width attribute on composite displays
        // ALSO, change the pubbly.events.offsets for proper hover/click location
        if (this.data.info.display === "composite") {
            let atFrontCover = (newPage === 0);
            let atRearCover = (newPage === this.getLastPage() && !this.getLastPageSpread());
            let canvasesAsCover = {
                previous: (newPage === 1),
                current: atFrontCover || atRearCover,
                next: (newPage + 1 === this.getLastPage() && !this.getLastPageSpread())
            };
            // Set event offset to half width if current canvase is cover
            let eventOffset = canvasesAsCover.current ? this.data.info.width / -2 : 0;
            this.events.offsets.pageOffsetX = eventOffset;
            // Restyle all canvases that are covers (could be two (prev and next)
            for (let canName in canvasesAsCover) {
                let placer = this.dom.canPlacers[canName];
                let can = placer.find("canvas");
                if (canvasesAsCover[canName]) {
                    can.attr("width", this.data.info.width);
                    placer.addClass("cover");
                } else {
                    can.attr("width", this.data.info.width * 2);
                    placer.removeClass("cover");
                }
            }
    }
    }

    removeTurningStylesFromCanvases() {
        /** During custom turn animations, the canvases have specific style attrs
         * EG, canvas.previous.left = -50%
         * 
         * When the turn has been finished, the canvases need to be unstyled
         *      so they go back to their default css rules
         */
        for (let placer in this.dom.canPlacers) {
            if (this.dom.canPlacers[placer][0]) {
                this.dom.canPlacers[placer][0].removeAttribute("style");
            }
        }
    }

    changeCurPage_dispatch(newPage, cbs) {
        /**
         * Sets the page to the arg1
         * Updates Nav UI
         * Unstyles/restyles canvases
         * Buffers lead
         * Calls back when ready for draw
         */
        this.ready = false;
        cbs = assignDefaultCallbacks(cbs);
        if (typeof newPage === "undefined") {
            console.error("Cannot set curPage: Value passed undefined");
        } else if (newPage < 0 || newPage >= this.data.pages.length) {
            console.error("Cannot set curPage: Value passed should be between 0 and " + this.data.pages.length - 1);
        } else {
            this.curPage = newPage;
            this.navigationUI.update(newPage);
            // Determine if we need another prog
            this.loadBufferLead(newPage, {
                done: function () {
                    // Call after, to avoid preturn canvas flicker.
                    this.updateCanvasAttrsWithNewPageValues(newPage);
                    // Call before resetting style attrs on canvas
                    this.drawPage_dispatch();
                    // Pubbly ready to recieve new sequence
                    this.ready = true;
                    cbs.done();
                }.bind(this),
                fail: cbs.error,
                prog: this.progressGraph.calculate
            });
        }
    }
    launch_dispatch(cbs) {
        /**
         * Enabled navUI (if applicable)
         * Unstyles/restyles canvases
         * Buffers preset assets
         * Buffers lead
         * Puts up DOM click cover, which calls back when clicked to a draw
         */

        this.updateCanvasAttrsWithNewPageValues();
        this.presetAssets.load({
            done: function () {
                this.loadBufferLead(this.curPage, {
                    done: function () {
                        this.progressGraph.end();
                        this.ready = true;
                        if (this.runtimeProps.environment === "app") {
                            cbs.done();
                        } else {
                            this.domInteractionCover.promptClick(cbs.done);
                        }

                    }.bind(this),
                    fail: cbs.fail,
                    prog: this.progressGraph.calculate
                })
            }.bind(this),
            fail: cbs.fail
        });
    }

    drawPage_dispatch(which = this.curPage) {
        if (typeof which === "object" && which.length) {
            which.map(page => this.drawPage_dispatch(page));
        } else if (Math.abs(which - this.curPage) > 1
                || !this.data.pages[which]) {
            let start = Math.max((this.curPage - 1), 0);
            let end = this.data.pages[this.curPage + 1] ?
                    this.curPage + 1 :
                    this.data.pages.length - 1;
            console.error("Pubbly.drawPage_dispatch: Can only draw prev, cur or next pages. Please call with a value between " + start + " and " + end + ". Not " + which);
        } else {
            let page = this.data.pages[which];
            let ctx = this.draw_readyAndReturnCTX(which);
            let btx;
            if (this.data.info.display === "composite") {
                // Already buffered by regular canvas, then drawn on left and right.
                btx = ctx;
            } else {
                // NOT buffered, this prevents fast frame redraw jitters;
                btx = this.bufferCtx;
                btx.canvas.height = ctx.canvas.height;
                btx.canvas.width = ctx.canvas.width;
            }


            /*  
             * Boy this would be clean right?
             * 
             * But not so fast. Fields and images all have their own layer. And if a field is in between two images, and you draw fields first, the layers are messed up.
             * So combine everything visual into a grand array, then call the specific draw function based on the type check during the loop
             */
            /*
             let imagesToDraw = page.objs.filter(o =>
             (o.type === "image" || o.type === "sequence"));
             let fieldsToDraw = page.objs.filter(o => o.type === "field");
             let workspacesToDraw = page.objs.filter(o => o.type === "workspace");
             let gifsToDraw = page.objs.filter(o => o.type === "gifs");
             
             imagesToDraw.map(i => this.draw_image(ctx, i, which));
             fieldsToDraw.map(f => this.draw_field(ctx, f, which));
             workspacesToDraw.map(w => this.draw_workSpace(ctx, w, which));
             gifsToDraw.map(g => this.draw_gif(ctx, g, which));
             */
            page.objs.sort(function (a, b) {
                // if ONE AND ONLY ONE is a video
                if ((a.type === "video" || b.type === "video") && (a.type !== "video" || b.type !== "video")) {
                    return (a.type === "video") ? 1 : -1;
                } else {
                    return a.layer - b.layer;
                }
            });
            let key = {
                "image": "draw_general",
                "clone": "draw_general",
                "sequence": "draw_general",
                "workspace": "draw_workspace",
                "field": "draw_field",
                "gifs": "draw_gif",
                "video": "draw_video",
            };
            page.objs.map(o => {
                if (typeof this[key[o.type]] === "function") {
                    this[key[o.type]](btx, o, which);
                }
            });
            page.links.map(l => {
                if (l.clickHighlightOn) {
                    this.drawLinks(ctx, l, this.data.info.HighlightLinkColorRGBA);
                }
            });
            if (this.data.info.display === "composite") {
                this.draw_cloneCanvasToSpread(ctx, which);
            } else {
                ctx.drawImage(btx.canvas, 0, 0, this.data.info.width, this.data.info.height);
            }

    }

    }

    draw_readyAndReturnCTX(drawPage, relativeHalf = "") {
        // drawPage >> Page you're targeting to draw. I.E., 5
        // relativeHalf >> right, left, or ""
        let baseClass = ["previous", "current", "next"][(drawPage + 1) - this.curPage];
        let spreadClass = "";
        if (relativeHalf === "left") {
            spreadClass = "SpreadLeft";
        } else if (relativeHalf === "right") {
            spreadClass = "SpreadRight";
        }
        // TODO: Save as props on turns, access quicker on draw
        let canCover = $("#canvases").find("div." + baseClass + spreadClass)[0];
        let can = $("#canvases").find("canvas." + baseClass + spreadClass)[0];
        let ctx = can.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        // * 1 to get rid of netbeans warning "weird assignment". Screw you NB, I know what I'm doing!!
        can.height = can.height * 1;
        can.width = can.width * 1;
        return ctx;
    }
    draw_elem(ctx, elem, objDesc) {
        if (objDesc.vis) {
            ctx.globalAlpha = objDesc.opacity;
            let args = [
                // Element to be drawn
                elem,
                // Unfortunately for ctx calls, it's left first, then top
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
                ctx.drawImage(elem, 0, 0, objDesc.width, objDesc.height);
                ctx.restore();
            } else {
                ctx.drawImage.apply(ctx, args);
            }
            ctx.globalAlpha = 1;
        }
    }
    draw_general(ctx, curObj, curPage) {
        let img;
        let relPath = (curObj.type == "sequence") ?
                curObj.frames[curObj.at].relPath :
                curObj.relPath;
        img = (curObj.type === "workspace") ?
                curObj.workspace.elem :
                this.pageBuffer.assetListLoaders[curPage].keys[relPath].elem;
        let objDesc = this.getRealObjDescription(curObj);
        if (img !== false) {
            this.draw_elem(ctx, img, objDesc);
        } else {
            console.error("Pubbly.draw_image: Missing image elem for " + curObj.fileName);
        }
    }
    draw_workspace(ctx, curWorkspace, curPage) {
        if (curWorkspace.clear) {
            curWorkspace.clear = false;
            curWorkspace.workspace.elem.width = curWorkspace.workspace.elem.width * 1;
        }
        let rect = [curWorkspace.loc[1], curWorkspace.loc[0], curWorkspace.width, curWorkspace.height];
        if (curWorkspace.bgTexture && curWorkspace.vis) {
            this.draw_texture(ctx, curWorkspace.bgTexture, rect);
        }
        this.draw_general(ctx, curWorkspace, curPage);
        if (this.drawingTools.drawCtx === curWorkspace.workspace.ctx) {
            ctx.drawImage(this.drawingTools.effectCanvas, curWorkspace.loc[1], curWorkspace.loc[0]);
        }
    }
    draw_field(ctx, curObj, relPage) {
        if (curObj.vis) {
            let text = curObj.contents || ""; // Default is fixed text.
            if (curObj.displayType === "points") {
                let localCheck = this.data.pages[relPage].points[curObj.display.toLowerCase()];
                let globalCheck = this.data.points[curObj.display.toLowerCase()];
                text = (typeof localCheck === "undefined") ? globalCheck : localCheck;
                if (typeof text === "undefined") {
                    error("warn", "draw page", "Undefined points reference: " + curObj.display);
                } else {
                    text = text.toString();
                }
            } else if (curObj.displayType === "countdown") {
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
                            drawTop
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
    }
    draw_gif(ctx, curGif) {
        console.log("TODO: Draw gif");
        console.log(curGif);
    }
    draw_cloneCanvasToSpread(ctx, curPage) {
        let pUnit = this.data.info.width;
        let ltx = this.draw_readyAndReturnCTX(curPage, "left");
        ltx.drawImage(ctx.canvas, 0, 0);
        let rtx = this.draw_readyAndReturnCTX(curPage, "right");
        rtx.drawImage(ctx.canvas, pUnit * -1, 0);
        // TODO: Remove styles?? Because turning page flicker?
    }
    draw_texture(ctx, curTexture, rect) {
        let image = this.presetAssets.list.find(i => i.relPath === "pubbly_engine/shared/textures/" + curTexture);
        if (image && image.elem) {
            let pattern = ctx.createPattern(image.elem, 'repeat');
            ctx.rect.apply(ctx, rect); // left top width height
            ctx.fillStyle = pattern;
            ctx.fill();
        }
    }
    draw_video(ctx, curVideo, rect) {
        let elem = this.pageBuffer.assetListLoaders[this.curPage].byFileName[curVideo.fileName].elem;
        let objDesc = this.getRealObjDescription(curVideo);
        this.draw_elem(ctx, elem, objDesc);
    }

    constructor(data, runtimeProps) {
        this.drawPage_dispatch = this.drawPage_dispatch.bind(this);
        this.fatalError = this.fatalError.bind(this);
        this.checkPageFor = this.checkPageFor.bind(this);
        this.loadBufferLead = this.loadBufferLead.bind(this);
        this.find = this.find.bind(this);
        this.findAll = this.findAll.bind(this);
        this.sendToTop = this.sendToTop.bind(this);
        this.runtimeProps = Object.assign(runtimeProps,
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
                    drawFieldBorders: false
                            // Ambitious! Will playback at double or half speed depending
                            // speedModified: 1
                });
        /*
         * Data of the pubbly book in question... Only variable thing between two books...
         * IN THEORY, we should be able to detach and re-attach new data, call a prelaunch, and get good stuff.
         * THEREFORE, data needs to be CLEAN json, nothing recursive, no logic, just data.
         * 
         * ... hence, it's called data.
         */
        this.data = data;
        // Current page of book, ZERO INDEXED
        this.curPage = this.runtimeProps.startPage;
        // this.commonElements = {}; WHAT IS THIS FOR?
        // Ready to run a sequence on the displayed page.
        this.ready = false;
        // CLASS CALLS
        this.lzwCompress = window.lzwCompress;
        this.dom = new PubblyDom(data, this.runtimeProps.environment);
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
        // TODO: It's own class please
        this.textCtx = document.createElement("canvas").getContext('2d');

        this.bufferCtx = document.createElement("canvas").getContext('2d');
        // Unnessisary, canvases can draw even if not dommed
        // document.body.appendChild(this.bufferCtx.canvas);
        // $(this.bufferCtx.canvas).css({"top":0,"left":0,"position":"absolute"});
        // Page turning, single and double
        this.turns = new Turns(this, this.data.info.display);
        // Ability to easily change cursor to our own custom library (keyed by action, not name)
        this.cursors = new Cursors($("#cancover"));
        // Clicks and touches
        this.events = new Events(this);
        // Revert to previous save state
        this.states = new States(this);
        // Timers for countdown elements in pubbly
        this.countdown = new Countdown(this);
        // Sequencing, includes all player functions
        this.sequence = new Sequence(this);
        // Since it's a dirty word for modern browsers, cleaner to keep workarounds in their own obj
        this.urlNav = new UrlNav(this.runtimeProps.environment);
        this.drawingTools = new PubblyDrawingTools(this, this.data.drawingTool);
        this.data.pages.forEach(p => {
            p.objs.forEach(o => {
                if (o.type === "workspace") {
                    o.workspace = new Workspace(o, this.dom.workspaces);
                }
            });
        });
        // Keeps track of frame rate stuff that requires the page to redraw at a 24fps interval.
        // Ensures that, if two things require redraw ints, you don't set two seperate ints.
        this.redrawDependency = new RedrawDependency(this.drawPage_dispatch.bind(this));
        this.progressGraph = new ProgressGraph("vertical_letters", this.dom.main.find("#loaderCont"));
        this.presetAssets = new PubblyPresetAssets();
        this.pageBuffer = new PubblyPageBuffer(this.data);
        this.domInteractionCover = new DomInteractionCover(this.dom.canvases);
        this.presetAssets.add(this.domInteractionCover.picked);
        this.launch_dispatch({
            done: function () {
                let pages = [0];
                if (this.data.pages[1]) {
                    pages.push(1);
                }
                this.drawPage_dispatch(pages);
                if (this.data.info.navigation) {
                    this.navigationUI.enable();
                }
                this.checkPageFor("openPages");
            }.bind(this),
            fail: this.fatalError
        });
    }
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
