function Events(pubblyScope) { // Scopped contstants are _InitCapsCamelCase
    const _Events = this;
    const _Pubbly = pubblyScope;

    // -- non scope constants (rare!) are _camelCase
    const _pUnit = pubblyScope.data.info.width;

    // Left|Right -> Direction of mouse | Left:Next, Right:Previous
    // Next|Previous -> Progression through book | Next: page++, Previous: page--
    //      this.m.turning == "left" means mouse is moving to the left means we're going to the NEXT page
    //      $(img.next).click means going to the next page means pages move to the LEFT


    /*
     Quick Info for dem e's
     
     Top Left of canvas
     -- Useless --
     e.clientX: loc to window left
     e.clientY: loc to window top
     e.pageX: same
     e.pageY: same
     
     e.screenX: loc to screen left
     e.screenY: loc to screen top
     
     e.target: Deepest dom element (canvas.current)
     
     
     -- Usefull --
     
     e.offsetX: loc to binded dom element left
     e.offsetY: loc to binded dom element top
     
     e.currentTarget: Binded dom element (#cancover)
     e.delegateTarget: same
     
     e.timeStamp: Timestamp. Dummy
     
     e.button: Button pressed to fire event
     e.buttons: Buttons ALREADY depressed when event fired
     
     -- Cool but unreliable --
     
     e.mozPressure: Force of touch
     e.webkitForce: same
     */

    // Static mouse properties
    this.m = {
        // Used to be interrupt time, but only ever used as a boolean, so now treated that way and access mostly in states.js
        // interrupt: false,
        reset: function () {
            this.start = [];
            this.down = false; // timestamp when mouse is down
            this.lastMouseLocs = [];

            this.turning = false; // direction of turn

            this.action = false;
            this.dragging = {
                // what:Obj that's dragging
                // start:start of drag in loc format
                // moved:have we commited to the drag, or could it still be a click?
            };
            this.lining = {};
            // See above
            // window.clearTimeout(this.interrupt);
        }
    }


    function DragRevert() {
        const _DragRevert = this;
        this.init = function () {
            // Used to animate non-drops back to ini
            // endStamp = now() + (speed * 1000), 
            //   time to end anim
            this.endStamp = false;
            // Interval function behind animation 
            this.interval = false;
            // Ball (the dragged and dropped obj
            this.what = false;
            // Original obj offsets before animation moved back
            this.origOffsets = [];
            // Speed of revert set in up (usually 0.2)
            this.speed = 200;
        };
        this.clear = function () {
            if (this !== _DragRevert) {
                _DragRevert.clear.call(_DragRevert);
            } else {
                window.clearInterval(this.interval);
                this.what.offsets = [0, 0, 0];
                if (this.what.type == "clone") {
                    // TEST: Might not work, this.what may not still be linked to the actual object that pubbly.js loooks at
                    this.what.markedForDeletion = true;
                    _Pubbly.clearClones(); // Loops through pages[0].objs arr, slices clones marked for deletion
                    _Pubbly.drawPage_dispatch(); // Draws page without deleted clone.
                }
                this.what = {};
                _Pubbly.drawPage_dispatch();
            }
        };
        this.animate = function () {
            this.interval = window.setInterval(function () {
                _DragRevert.animLeg.call(_DragRevert);
            }, 10);
        };
        this.animLeg = function () {
            let left = this.endStamp - now();
            let percent = left / this.speed;
            if (percent < 0) {
                this.clear();
            } else {
                if (typeof this.what == "undefined") {
                    this.clear.call(this);
                } else {
                    this.what.offsets[0] = this.origOffsets[0] * percent;
                    this.what.offsets[1] = this.origOffsets[1] * percent;
                    _Pubbly.drawPage_dispatch();
                }
            }
        };
        this.init();
    }

    // Animations
    //  -- Something not triggered through sequencing, but rather a visual effect built into the system
    //  -- Currently, dragReverst. But can also add touch ripple and such here
    this.a = {
        dragRevert: new DragRevert(),
        reset: function () {
            // TODO: Clear all animations

            // UNTESTED
            for (let anims in _Events.a) {
                if (typeof _Events.a[anims].clear == "function") {
                    _Events.a[anims].clear();
                }
            }
        }
    }
    this.m.reset();
    // Field shit
    this.f = {
        init: function () {
            this.elem = _Pubbly.dom.textEntryHidden;
            this.editing = false;
            this.badKeys = [33, 34, 35, 36, 37, 38, 39, 40, 45, 46];
            this.stringLimit = 500;
            this.field = false;
            // Attachin events
            let _FieldScope = this;
            this.elem.keydown(function (e) {
                _FieldScope.type.call(_FieldScope, e)
            });
        },
        clear: function () {
            window.clearInterval(this.insertionBlink);
            this.field.editing = false;
            this.field = false;
            this.val = "";
            this.insertionAt = 0;
            this.elem.val("");
            this.editing = false;
            this.elem.blur();
        },
        edit: function (field, click) {
            this.clear();
            this.elem.val(field.contents);
            this.editing = true;
            this.field = field;
            field.editing = true;
            // Double focus, cordova bug fix.
            this.elem.focus();
            this.elem.focus();
            // Why no scrollTop? Because textarea is abs screen center. No scrolling needed
            this.val = field.contents;


            let relClick = [click[1] - this.field.loc[0], click[0] - this.field.loc[1]];
            let insertStart = {
                line: 0,
                char: 0,
                at: 0,
            };
            if (this.field.contents !== "" && this.field.calculated) {
                _Pubbly.textCtx.font = this.field.calculated.size + "pt " + this.field.font;
                // figure out insertionAt
                let lines = this.field.contents.toString().split('\n');
                insertStart.line = Math.floor(relClick[1] / this.field.calculated.lineHeight);
                insertStart.line = Math.min(insertStart.line, lines.length - 1);
                insertStart.line = Math.max(insertStart.line, 0);
                let str = lines[insertStart.line];
                let lineLeft = 0;
                let strWidth = false;
                if (this.field.align !== "left") {
                    strWidth = _Pubbly.textCtx.measureText(str).width;
                }
                if (this.field.align == "center") {
                    lineLeft += (this.field.width - strWidth) / 2;
                } else if (this.field.align == "right") {
                    lineLeft += this.field.width - strWidth;
                }
                let partialLen = 0;
                insertStart.char = 0;
                let charWidth = _Pubbly.textCtx.measureText("M").width;
                do {
                    let partialStr = str.substring(0, insertStart.char);
                    partialLen = _Pubbly.textCtx.measureText(partialStr).width;
                    partialLen += charWidth * 0.6; // Fuck fonts
                    insertStart.char++;
                } while (
                        lineLeft + partialLen < relClick[0] &&
                        insertStart.char <= str.length
                        );
                insertStart.char--;

                // Not working, and need to clean up... For now...
                insertStart.char = str.length;
                for (let l = 0; l < insertStart.line; l++) {
                    insertStart.at += lines[l].length + 1;
                }
                insertStart.at += insertStart.char;
            }
            this.insertionPoint.init(insertStart.at);
        },
        insertionPoint: {
            interval: false,
            blinkTime: 500,
            on: false,

            blink: function () {
                _Pubbly.drawPage_dispatch();
                this.on = !this.on;
            },
            start: function () {
                let scope = this;
                window.clearInterval(this.interval);
                this.interval = window.setInterval(function () {
                    scope.blink.call(scope);
                }, this.blinkTime);
                this.on = true;
                scope.blink.call(scope);
            },
            init: function (insertionAt) {
                this.at = insertionAt;

                // Set insertion point to this.at
                let input = pubbly.dom.textEntryHidden[0];
                if (input.setSelectionRange) {
                    input.focus();
                    input.setSelectionRange(this.at, this.at);
                } else if (input.createTextRange) {
                    var range = input.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', this.at);
                    range.moveStart('character', this.at);
                    range.select();
                }

                this.start();
            }
        },
        type: function (e) {
            if (this.badKeys.indexOf(e.keyCode) !== -1 || this.val.length > this.stringLimit - 1) {
                e.preventDefault(); // NO MOVEMENT!
            } else {
                let _This = this;
                window.setTimeout(function () {
                    _This.val = _This.elem.val();
                    _This.field.contents = _This.val + "";
                    // Recalculate on every new character
                    if (_This.field.size == "auto") {
                        _This.field.calculated.size = false;
                    }
                    _This.insertionPoint.at = _This.elem.prop("selectionStart");
                    _This.insertionPoint.start();
                }, 1);
            }
        }
    }
    this.f.init();


    // Can set to whatever, but mostly going to be used for cover events
    // Props because maybe more, also easier to pass to cursorInput.js
    // Originally set in pubbly.js 
    this.offsets = {
        pageOffsetX: 0,
        pageOffsetY: 0,
    };
    // this.pageOffsetX = 0;
    // this.pageOffsetY = 0;

    // decrease for easier turning.
    this.dragEventsBeforeTurnDetermination = 5;

    this.getDir = function (speedArr) {
        // Returns "left", "right" or false if inconsistant
        let consistantDir = "";
        for (let i = 1; i < speedArr.length; i++) {
            // Double check left and right in build
            let newDir = (speedArr[i][0] - speedArr[i - 1][0] > 0) ? "left" : "right";
            if (consistantDir === "") {
                // First compare sets direction
                consistantDir = newDir;
            } else if (consistantDir !== newDir) {
                // Subsequent compares either comfirm direction as same as last
                //      - do nothing
                // OR deny the this.m.turning set
                //      - consistantDir = false (let loop run out... if more than 5, add consistantDir !== false to loop conditional
                consistantDir = false;
            }
        }

        // TODO: Add a hold check (if the user turns, then holds for X seconds, it's a reset no matter the dir consistancy
        let holdCheck = false; // True if turned and held half way
        // TODO: Add a flip check? (If it's a quick one finger flip geuster... it might not get caught in the dir check? maybe who knows)
        let flipCheck = false;

        if (holdCheck) {
            return false;
        } else if (flipCheck) {
            return flipCheck;
        } else {
            return consistantDir;
        }
    };


    /* Not working on some displays
     * eg, touch screen laptop
     if (useTouch()) {
     this.getLoc = this.getTouchLoc;
     } else {
     this.getLoc = this.getMouseLoc;
     }
     */
    this.cursor = new CursorInput(); // Combine touch/mouse event grabs into a single unified func
    this.getLoc = this.cursor.getLoc;

    this.raw = {
        move: function (e) {
            if (e.buttons === 0) {
                this.raw.hover.call(this, e);
            } else {
                this.m.interrupt = _Pubbly.states.checkInterruptionsAndSave(function () {
                    _Events.raw.drag.call(_Events, e);
                });
            }
        },
        hover: function (e) {
            let loc = this.getLoc(e, this.offsets);
            let caught = _Pubbly.checkLocFor(loc, ["lineStarts", "dragStarts", "drawStarts", "editableFields", "clicks"]);
            let cursor = (caught[0]) ? caught[0].action : false;
            _Pubbly.cursors.set(cursor, "hover");
        },
        drag: function (e) {
            let loc = this.getLoc(e, this.offsets);
            this.m.lastMouseLocs.unshift(loc);

            if (this.m.action == "dragging" || this.m.action == "cloning") {
                // This block for either a point (tell user he can drop) or a not-pointer (can't drop)
                let caught = _Pubbly.checkLocFor(loc, ["dragStops"], this.m.dragging.what.name);
                if (caught[0]) {
                    _Pubbly.cursors.set("drop", "drag");
                } else {
                    _Pubbly.cursors.set("no-drop", "drag");
                }

                let offsets = [
                    // Why the flip? Because loc is in left top format (for inside and all taht)
                    // While objects are always top left.
                    // Honestly, this is a mess and I should fix it but PUUUSH
                    loc[1] - this.m.dragging.start[1],
                    loc[0] - this.m.dragging.start[0],
                    loc[2] - this.m.dragging.start[2]
                ];
                // Movement, either left or right, that distinguished between a dragging event to a sloppy click
                let clickDragThreshold = 10;
                if (!this.m.dragging.moved &&
                        (
                                Math.abs(offsets[0]) +
                                Math.abs(offsets[1]) >
                                clickDragThreshold
                                )) {
                    this.m.dragging.moved = true;
                }

                if (this.m.dragging.moved) {
                    this.m.dragging.what.offsets = offsets;

                }
                _Pubbly.drawPage_dispatch();
            } else if (this.m.action == "lining") {
                this.m.lining.end = loc;
                _Pubbly.drawPage_dispatch();
            } else if (["draw-chalk", "draw-eraser", "draw-marker", "draw-pen", "draw-pencil"].indexOf(this.m.action) > -1) {
                let caught = _Pubbly.checkLocFor(loc, ["drawStarts", "clicks"])[0] || false;
                if (caught
                        && caught.link
                        && ["draw-chalk", "draw-eraser", "draw-marker", "draw-pen", "draw-pencil"].indexOf(caught.action) > -1
                        && (
                                !_Pubbly.drawingTools.drawCtx
                                || _Pubbly.drawingTools.drawCtx === caught.link.workspace.ctx)) {
                    let curObj = caught.link;
                    let ctx = curObj.workspace.ctx;
                    // don't ask
                    let relLoc = [loc[0] - curObj.loc[1], loc[1] - curObj.loc[0]];
                    _Pubbly.drawingTools.draw(ctx, relLoc);
                    _Pubbly.drawPage_dispatch();
                } else {
                    // Pencil up effect 
                    // Otherwise, draw, offscreen, move, back on screen, weird line from last good to current
                    // TODO: Generalize for chalk
                    if (_Pubbly.drawingTools.tool.type === "pencil"
                            && _Pubbly.drawingTools.temporaryDrawData.pencilPath[_Pubbly.drawingTools.temporaryDrawData.pencilPath.length - 1] !== false) {
                        _Pubbly.drawingTools.temporaryDrawData.pencilPath.push(false);
                    }
                }
            } else if (this.m.lastMouseLocs.length > this.dragEventsBeforeTurnDetermination) {
                this.m.lastMouseLocs.pop();
                if (!this.m.turning) {
                    // check for consistant left or right in last 5
                    let tmpDir = this.getDir(this.m.lastMouseLocs);
                    if (tmpDir) {
                        this.m.turning = tmpDir;
                    }
                }

                // DUCT: Why not else? Because this.m.turning is set inside the last conditional... so double check her to catch it on first set.
                if (this.m.turning) {
                    this.m.action = "turning";
                    let cur = this.m.lastMouseLocs[0][0];
                    let start = this.m.start[0];
                    let percent = (this.m.turning == "left") ?
                            1 - (cur / _pUnit) :
                            (cur - start) / (_pUnit - start);

                    // Between 0 and 1
                    percent = Math.max(percent, 0);
                    percent = Math.min(percent, 1);

                    _Pubbly.turns.handlers.set.call(_Pubbly.turns, this.m.turning, percent);
                }
            }
        },
        down: function (e) {
            this.m.interrupt = _Pubbly.states.checkInterruptionsAndSave(function () {
                _Events.raw.check.call(_Events, e);
            });
        },
        check: function (e) {
            let loc = this.getLoc(e, this.offsets);
            this.m.down = true;
            this.m.start = loc;


            if (this.f.editing) {
                this.f.clear();
            }

            let caught = _Pubbly.checkLocFor(loc, ["lineStarts", "dragStarts", "drawStarts", "editableFields", "clicks"])[0] || false;
            // Click, drag or undefined (works formeee)
            let cursorLibrary = "default";
            let cursorAction = caught.action; // for the most part
            // The .moved property is only used to determine whether the movement should be DRAWN in the pubbly redraw function
            if (caught.action === "drag" || caught.action === "clone") {
                cursorLibrary = "drag";
                this.m.action = (caught.action == "drag") ? "dragging" : "cloning";
                if (this.m.action == "cloning") {
                    caught = _Pubbly.makeClone(caught.link);
                } else {
                    caught = caught.link;
                }
                this.m.dragging = {
                    what: caught,
                    start: loc,
                    moved: false,
                }
                // Move object to front
                if (this.m.dragging.what.frontDrag === true) {
                    _Pubbly.sendToTop.call(_Pubbly, caught);
                }
                caught.offsets = [0, 0, 0];
                // droppedLoc is if the item has been dropped and accepted.
                if (caught.droppedLoc) {
                    // So if it was a previously dragged object, put droppedLoc back into offsets so you're dragging at mouse pickup.
                    // THIS IS A HUUGE MESS. Decide on top left or left top, but friggen stick with it.
                    this.m.dragging.start[0] -= (caught.droppedLoc[1] - caught.loc[1]);
                    this.m.dragging.start[1] -= (caught.droppedLoc[0] - caught.loc[0]);
                }
                // CLEAR so that drop -> accepted -> redrag -> drop -> not accepted, you revert to init loc
                this.m.dragging.what.droppedLoc = false;

                // Drags, drops, ball starts moving back, user catches it mid move.
                if (this.a.dragRevert.what == caught) {
                    this.a.dragRevert.clear();
                }
            } else if (caught.action === "single" || caught.action === "multiple") {
                cursorLibrary = "line";
                let fakeLinesFromCenter = false;
                let startLoc = [loc[1], loc[0]];
                if (fakeLinesFromCenter) {
                    startLoc = centerOfPoly(caught.link.poly);
                }
                this.m.action = "lining";
                if (caught.action == "single"
                        || typeof caught.link.lines == "undefined") {
                    caught.link.lines = [];
                }
                caught.link.lines.push({
                    start: [startLoc[1], startLoc[0]],
                    end: [startLoc[1], startLoc[0]],
                    name: caught.link.name + "",
                });
                this.m.lining = caught.link.lines[caught.link.lines.length - 1];
                _Pubbly.drawPage_dispatch();
            } else if (["draw-chalk", "draw-eraser", "draw-marker", "draw-pen", "draw-pencil"].indexOf(caught.action) > -1) {
                this.m.action = caught.action;
                _Pubbly.drawPage_dispatch();
            } else if (caught.action === "editText") {
                // Use default cursor library and action
                this.f.edit(caught.link, loc);
            }
            _Pubbly.cursors.set(cursorAction, cursorLibrary);
        },
        up: function (e) {
            if (this.m.down) {
                if (!_Pubbly.sequence.running) {
                    let loc = this.getLoc(e, this.offsets);
                    let caught = false;
                    if (this.m.action == "turning") {
                        // finish turn
                        if (this.getDir(this.m.lastMouseLocs) == this.m.turning) {
                            _Pubbly.turns.handlers.end.call(_Pubbly.turns, this.m.turning/*,TODO:speed*/);
                        } else {
                            _Pubbly.turns.handlers.reset.call(_Pubbly.turns);
                        }
                    } else if ((this.m.action == "dragging" || this.m.action == "cloning")) {
                        if (this.m.dragging.moved) {
                            caught = _Pubbly.checkLocFor(loc, "dragStops", this.m.dragging.what.name);
                            if (caught[0]) {
                                // Snap to center if prop set
                                let what = this.m.dragging.what;
                                if (_Pubbly.data.info.snapDrops) {
                                    let polyCenter = centerOfPoly(caught[0].link.poly);
                                    this.m.dragging.what.droppedLoc = [
                                        polyCenter[0] - what.height / 2,
                                        polyCenter[1] - what.width / 2,
                                    ];
                                } else {
                                    // hard code offset as new location
                                    this.m.dragging.what.droppedLoc = [
                                        what.loc[0] + what.offsets[0],
                                        what.loc[1] + what.offsets[1],
                                    ];
                                }
                                what.offsets = false;
                                _Pubbly.drawPage_dispatch();
                                // Start new stops old
                                // _Pubbly.sequence.startNew(caught[0], this.m.action);
                            } else {
                                // Animate dragged object back to it's init
                                this.a.dragRevert.clear();
                                this.a.dragRevert.endStamp = now() + this.a.dragRevert.speed;
                                this.a.dragRevert.what = this.m.dragging.what;
                                this.a.dragRevert.origOffsets = [
                                    this.m.dragging.what.offsets[0] * 1,
                                    this.m.dragging.what.offsets[1] * 1,
                                ]
                                this.a.dragRevert.animate();
                            }
                        } else if (this.m.action === "cloning") {
                            this.m.dragging.what.markedForDeletion = true;
                            _Pubbly.clearClones(); // Loops through pages[0].objs arr, slices clones marked for deletion
                            _Pubbly.drawPage_dispatch(); // Draws page without deleted clone.
                        }
                    } else if (this.m.action == "lining") {
                        caught = _Pubbly.checkLocFor(loc, "lineStops", this.m.lining.name);
                        if (caught[0]) {
                            if (_Pubbly.data.info.snapLinesToCenter) {//TODO:get prop
                                this.m.lining.end = centerOfPoly(caught[0].link.poly);
                            }
                            // _Pubbly.sequence.startNew(caught[0], this.m.action);
                        } else {
                            // TODO: Maybe a line deny anim?
                            this.m.lining.start = false;
                            this.m.lining.end = false;
                            this.m.lining.markedForDeletion = true;
                            _Pubbly.clearLines();
                            _Pubbly.drawPage_dispatch();
                        }
                    } else if (["draw-chalk", "draw-eraser", "draw-marker", "draw-pen", "draw-pencil"].indexOf(this.m.action) > -1) {
                        _Pubbly.drawingTools.drawStop();
                    } else {
                        caught = _Pubbly.checkLocFor(loc, "clicks");
                        if (caught[0]) {
                            // _Pubbly.sequence.startNew(caught[0], this.m.action);
                        }
                    }

                    if (caught[0]) {
                        _Pubbly.sequence.startNew(caught[0], this.m.action);
                        // sue me
                        if (caught[0].link.clickHighlight) {
                            caught[0].link.clickHighlightOn = true;
                            _Pubbly.drawPage_dispatch();
                            window.setTimeout(function () {
                                caught[0].link.clickHighlightOn = false;
                                _Pubbly.drawPage_dispatch();
                            }, _Pubbly.data.info.HighlightLinkTime);
                        }
                    }
                }
                this.m.reset();
            }
        },
    }

    function attach() {
        $("#cancover").bind('mousemove touchmove', function (e) {
            e.preventDefault();
            _Events.raw.move.call(_Events, e);
        });
        $("#cancover").bind('mousedown touchstart', function (e) {
            e.preventDefault();
            _Events.raw.down.call(_Events, e);
        });
        $("#cancover").bind('mouseup mouseout touchend', function (e) {
            e.preventDefault();
            _Events.raw.up.call(_Events, e);
        });
        $("#header .navigationUI .previous img").click(function () {
            if (!$(this).parent().hasClass("disabled")) {
                _Pubbly.states.checkInterruptionsAndSave(function () {
                    _Pubbly.turns.handlers.auto.left();
                });
            }
        });
        $("#header .navigationUI .next img").click(function () {
            if (!$(this).parent().hasClass("disabled")) {

                _Pubbly.states.checkInterruptionsAndSave(function () {
                    _Pubbly.turns.handlers.auto.right();
                });
            }
        });
        $("#header .navigationUI .goto select").mousedown(function (e) {
            if ($(this).parent().hasClass("disabled")) {
                e.preventDefault();
                this.blur();
                window.focus();
            }
        });
        $("#header .navigationUI .goto select").change(function () {
            if (!$(this).parent().hasClass("disabled")) {
                let newPage = this.selectedIndex;
                _Pubbly.states.checkInterruptionsAndSave(function () {
                    if (newPage !== _Pubbly.curPage) {
                        _Pubbly.changeCurPage_dispatch.call(_Pubbly, newPage);
                    }
                });
            }
        });
    }
    attach.call(this);
}

