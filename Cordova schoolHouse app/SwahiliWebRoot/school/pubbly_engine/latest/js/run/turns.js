function Turns(pubblyScope, display = "single") {
    // Why _Pubbly to pubblyScope to _Pubbly? Not sure if declaring as arg makes it a const
    const _Pubbly = pubblyScope;
    const _Turns = this;

    this.speed = [];
    this.prepped = false;
    this.turnStartOffset = 0;
    this.cans = {};

    this.moving = false;
    this.display = display;
    this.type = false;
    this.lastPercent = false;

    this.prepTurn = function (dir, percent = 0) {
        _Pubbly.navigationUI.disable();
        if (_Pubbly.curPage - 1 >= 0) {
            _Pubbly.drawPage_dispatch(_Pubbly.curPage - 1)
        }
        if (_Pubbly.curPage + 1 <= _Pubbly.data.pages.length - 1 || !_Pubbly.data.info.lastPageSpread) {
            _Pubbly.drawPage_dispatch(_Pubbly.curPage + 1);
        }
        this.turnStartOffset = percent; // turns that start at 168px still starts at 0%
        this.turnStartBellCurve = 1 / (1 - percent); // What you * by to ensure an offset turn ends at 100% (Math.min cause infinity)
        this.prepped = dir;
        let cover = $("#pubbly_main #canvases #cancover");

        // save time by proping dom queries
        this.cans.all = cover.find("div.canPlacer");
        this.cans.previous = cover.find("div.previous");
        this.cans.current = cover.find("div.current");
        this.cans.next = cover.find("div.next");

        if (this.display == "composite") {
            this.cans.currentSpreadLeft = cover.find("div.currentSpreadLeft");
            this.cans.currentSpreadRight = cover.find("div.currentSpreadRight");
            this.cans.nextSpreadLeft = cover.find("div.nextSpreadLeft");
            this.cans.nextSpreadRight = cover.find("div.nextSpreadRight");
            this.cans.previousSpreadLeft = cover.find("div.previousSpreadLeft");
            this.cans.previousSpreadRight = cover.find("div.previousSpreadRight");
        }

        if (this.display == "single") {
            if (dir == "right") {
                this.type = "singleRight";
                this.cans.previous.css("z-index", 2);
                this.cans.current.css("z-index", 3);
                this.cans.next.css("z-index", 1);
            } else if (dir == "left") {
                this.type = "singleLeft";
                this.cans.previous.css("z-index", 1);
                this.cans.current.css("z-index", 3);
                this.cans.next.css("z-index", 2);
            }
        } else {
            // Use spreadLeft and spreadRight canvases exclusively for turning.
            this.cans.previous.css("z-index", -1);
            this.cans.next.css("z-index", -1);

            if (_Pubbly.curPage == 0) {
                this.type = "frontToSpread";
            } else if (_Pubbly.curPage == 1 && dir == "right") {
                this.type = "spreadToFront";
            } else if (_Pubbly.curPage == _Pubbly.data.pages.length - 1 && !_Pubbly.data.info.lastPageSpread) {
                this.type = "backToSpread";
            } else if (_Pubbly.curPage == _Pubbly.data.pages.length - 2 && dir == "left" && !_Pubbly.data.info.lastPageSpread) {
                this.type = "spreadToBack";
            } else {
                if (dir == "left") {
                    this.type = "spreadToSpreadLeft";
                } else {
                    this.type = "spreadToSpreadRight";
                }
            }
            this.cans.all.css("display", "none");
            switch (this.type) {
                case "frontToSpread":
                    this.cans.current.css({"z-index": 2, "display": "block"});
                    this.cans.nextSpreadLeft.css({"z-index": 3, "display": "block"});
                    this.cans.nextSpreadRight.css({"z-index": 1, "display": "block"});
                    break;
                case "spreadToFront":
                    this.cans.previous.css({"z-index": 2, "display": "block"});
                    this.cans.currentSpreadLeft.css({"z-index": 3, "display": "block", "margin-left": "0%"});
                    this.cans.currentSpreadRight.css({"z-index": 1, "display": "block", "margin-left": "50%"});
                    break;
                case "backToSpread":
                    this.cans.current.css({"z-index": 1, "display": "block"});
                    this.cans.previousSpreadLeft.css({"z-index": 2, "display": "block"});
                    this.cans.previousSpreadRight.css({"z-index": 3, "display": "block"});
                    break;
                case "spreadToBack":
                    this.cans.current.css({"z-index": 1, "display": "block"});
                    this.cans.next.css({"z-index": 2, "display": "block"});
                    break;
                case "spreadToSpreadLeft":
                    this.cans.current.css({"z-index": 2, "display": "block"});
                    this.cans.nextSpreadLeft.css({"z-index": 3, "display": "block"});
                    this.cans.nextSpreadRight.css({"z-index": 1, "display": "block"});
                    break;
                case "spreadToSpreadRight":
                    this.cans.current.css({"z-index": 1, "display": "block"});
                    this.cans.previousSpreadLeft.css({"z-index": 3, "display": "block"});
                    this.cans.previousSpreadRight.css({"z-index": 2, "display": "block"});
                    // TODO: Make a better fix
                    // -- Explanation... For the left turn spread to spread revert, the canvas NEEDS to be right justified.
                    // Since the parent container is block but the canvas isn't, it doesn't get the % value from the parent previousSpreadRight div... Rather the cancover...
                    // So the fix fix of this is to margin left calc this shit... Added here, removed in the endTurn
                    $(".previousSpreadRight canvas").css("margin-left", "calc(100% - " + _Pubbly.data.info.width + "px)");
                    break;
            }
    }
    };
    this.manualAnimate = function (speed, revert) {
        // lastPercent gets set in the handler.set function, therefore
        // We have to unlink it, otherwise everything bad bad
        this.manualAnimation = {
            revert: revert,
            lastPercent: this.lastPercent * 1,
            dir: this.prepped,
            endStamp: now() + (speed * 1000),
            speed: speed * 1000,
            interval: false,
        }
        // Why all the now()s? Because if the JS lags, I would rather have bad frame rate than laggy page. Right? So it calls the set function as fast as it can, but changes the percent it calls with to match how long it was since the last call! I"M SMART!!
        this.manualAnimation.interval = window.setInterval(function () {
            let info = _Turns.manualAnimation;
            // millis left before animation is done
            let left = (info.endStamp - now());

            // Percentage of animation left to do (0 - 1)
            let animationPercent = Math.abs((left / info.speed) - 1);

            // Actual percentage to call func with
            let truePercent;
            if (info.revert) {
                truePercent = info.lastPercent - (animationPercent * info.lastPercent);
            } else {
                truePercent = info.lastPercent + (animationPercent * (1 - info.lastPercent));
            }
            if (left > 0) {
                _Turns.handlers.set.call(_Turns, info.dir, truePercent);
            } else {
                _Turns.handlers.set.call(_Turns, info.dir, !info.revert); // 0 for revert, 1 for not
                window.clearInterval(_Turns.manualAnimation.interval);
                if (info.revert) {
                    _Turns.prepped = false;
                }
                _Turns.manualAnimation = {};
                window.setTimeout(function () {
                    _Turns.endTurn.call(_Turns);
                }, 10);
            }
        }, 10);
    }
    this.handlers = {
        manual: {
            left: function (percent) {
                _Turns.handlers.set.call(_Turns, "right", percent);
            },
            right: function (percent) {
                _Turns.handlers.set.call(_Turns, "left", percent);
            },
        },
        auto: {
            left: function () {
                _Turns.handlers.end.call(_Turns, "right");
            },
            right: function () {
                _Turns.handlers.end.call(_Turns, "left");
            }
        },
        // MIGHT be the same for double pages, but not sure... so keep in the single/double handler loc
        canTurn: function (dir) {
            let curPage = _Pubbly.curPage;
            let lastPage = _Pubbly.data.pages.length;
            let canTurn = ((dir == "left" && curPage < lastPage - 1)
                    || (dir == "right" && curPage >= 1));
            return canTurn;
        },
        set: function (dir, percent) {
            // NOTE: Pre prepTurn, percent is absolute.
            //      - I.E. loc/width... can start at something like 50%
            // prepTurn sets this.turnStartOffset, which is the FIRST percent ever SET
            // We use that offset to smooth turns (every turn is 0-100%, no matter where it starts)
            if (this.handlers.canTurn(dir)) {
                if (!this.prepped) {
                    this.prepTurn(dir, percent);
                }
                this.lastPercent = percent;
                let smoothPercent = Math.max(percent - this.turnStartOffset, 0) * this.turnStartBellCurve;

                let vals;
                if (this.type == "singleRight") {
                    vals = {
                        previous: {
                            marginLeft: -100 + (smoothPercent * 100),
                        },
                        current: {
                            marginLeft: smoothPercent * 100,
                        },
                        next: {
                            marginLeft: 100,
                        }
                    }
                } else if (this.type == "singleLeft") {
                    vals = {
                        previous: {
                            marginLeft: -100,
                        },
                        current: {
                            marginLeft: smoothPercent * -100,
                        },
                        next: {
                            marginLeft: 100 + (smoothPercent * -100),
                        }
                    }
                } else if (this.type == "frontToSpread") {
                    // 0 - 0.33 as 0 - 1
                    let tp1 = Math.min(smoothPercent * 3, 1); // 0 - 1 in a third the time
                    // 0.33 - 1 as 0 - 1
                    let tp2 = Math.max(0, (smoothPercent - (1 / 3)) * (3 / 2));
                    vals = {
                        current: {
                            marginLeft: 25 + (tp1 * 25),
                            width: 50 - (tp2 * 100),
                        },
                        nextSpreadLeft: {
                            marginLeft: 100 - (tp2 * 100),
                            width: tp2 * 50,
                        },
                        nextSpreadRight: {
                            marginLeft: 25 + (tp1 * 25),
                            width: 50,
                        }
                    }
                } else if (this.type == "spreadToFront") {
                    // Why the lazy reverse animation?
                    // Because a better one requires the canvas moves inside the div!
                    // previous (cover) has to fold over currentSpreadLeft, while maintaining half width transparency until full fold...
                    //
                    // So it's a big hassel and I don't waaaaaana
                    // But maybe one day, TODO:

                    // 1-0
                    let inverse = Math.abs(smoothPercent - 1);
                    // 0 - 0.33 as 0 - 1
                    let tp1 = Math.min(inverse * 3, 1); // 0 - 1 in a third the time
                    // 0.33 - 1 as 0 - 1
                    let tp2 = Math.max(0, (inverse - (1 / 3)) * (3 / 2));
                    vals = {
                        previous: {
                            marginLeft: 25 + (tp1 * 25),
                            width: 50 - (tp2 * 100),
                        },
                        currentSpreadLeft: {
                            marginLeft: 100 - (tp2 * 100),
                            width: tp2 * 50,
                        },
                        currentSpreadRight: {
                            marginLeft: 25 + (tp1 * 25),
                            width: 50,
                        }
                    }
                } else if (this.type == "spreadToSpreadLeft") {
                    // 1-0
                    let inverse = Math.abs(smoothPercent - 1);
                    vals = {
                        current: {
                            marginLeft: 0,
                            width: inverse * 100,
                        },
                        nextSpreadLeft: {
                            marginLeft: inverse * 100,
                            width: smoothPercent * 50,
                        },
                        nextSpreadRight: {
                            marginLeft: 50,
                            width: 50,
                        }
                    }
                } else if (this.type == "spreadToSpreadRight") {
                    // console.log("PROBLEM");
                    let inverse = Math.abs(smoothPercent - 1);
                    vals = {
                        current: {
                            marginLeft: 0,
                            width: 100,
                        },
                        previousSpreadRight: {
                            marginLeft: smoothPercent * 50,
                            width: smoothPercent * 50,
                        },
                        previousSpreadLeft: {
                            marginLeft: 0,
                            width: smoothPercent * 50,
                        },
                    }
                    // $(".previousSpreadRight canvas").css("margin-left","calc(100% - 600px)");
                } else if (this.type == "spreadToBack") {
                    // 0 - 0.66 as 0 - 1
                    let tp1 = Math.min(smoothPercent * (3 / 2), 1);
                    // 0.66 - 1 as 0 - 1
                    let tp2 = Math.max(0, smoothPercent - (2 / 3)) * 3;
                    vals = {
                        current: {
                            marginLeft: 0,
                            width: Math.abs(tp1 - 1) * 100,
                        },
                        next: {
                            // 100-0 until 0.66, then 0-25
                            marginLeft: Math.max(
                                    Math.abs(tp1 - 1) * 100,
                                    tp2 * 25
                                    ),
                            width: tp1 * 50,
                        }
                    }
                } else if (this.type == "backToSpread") {
                    // 0 - 0.33 as 0 - 1
                    let tp1 = Math.min(smoothPercent * 3, 1); // 0 - 1 in a third the time
                    // 0.33 - 1 as 0 - 1
                    let tp2 = Math.max(0, (smoothPercent - (1 / 3)) * (3 / 2));


                    vals = {
                        current: {
                            marginLeft: Math.abs(tp1 - 1) * 25,
                            width: 50,
                        },
                        previousSpreadRight: {
                            marginLeft: tp2 * 50,
                            width: tp2 * 50,
                        },
                        previousSpreadLeft: {
                            marginLeft: 0,
                            width: tp2 * 50,
                        }
                    }
                } else {
                    error("fatal", "turning", "Unknown turn type of " + this.type)
                }

                for (let v in vals) {
                    for (let p in vals[v]) {
                        if (this.cans[v]) {
                            this.cans[v].css(p, vals[v][p] + "%");
                        }
                    }
                }
            } else {
                // IDEA: Maybe a bump to signify "end of book"
            }
        },
        end: function (dir, speed = 0.5) {
            if (this.handlers.canTurn(dir)) {
                // Turns pages in PowerPoint fashion. Uses css transition setting only
                if (this.moving) {
                    error("log", "Page turn end", "Cannot end pageturn, animation in progress");
                } else {
                    if (!this.prepped) {
                        this.prepTurn(dir);
                    }
                    this.moving = true;
                    this.manualAnimate.call(this, 0.5, false);
                }
            } else {
                // IDEA: Bump to signify end
        }
        },
        reset: function (speed = 0.5) {
            if (this.prepped) {
                this.manualAnimate.call(this, speed, true);
            } else {
                // Never prepped? Pages never moves, indexs are all fine, do nothing
        }
        }
    }
    this.endTurn = function () {
        // TODO: Fix this
        // -- This is the manual style removal from the spreadToSpreadRight problem we have to deal with... Need to right justify the canvas in the block... Easier like this... butshitty
        $(".previousSpreadRight canvas").css("margin-left", "");
        _Pubbly.navigationUI.enable();
        let dir = this.prepped;
        let newPage = _Pubbly.curPage;
        if (dir == "left") {
            newPage++;
        } else if (dir == "right") {
            newPage--;
        }

        // Reset props for next turn
        this.moving = false;
        this.prepped = false;
        this.lastPercent = false;

        // Set cover to correct element
        // _Pubbly.setCanvasClasses.call(_Pubbly, newPage);

        // THEN remove styling (otherwise flicker of previous canvas in current spot)
        // Remove all styling set by js or jq
        // Here's where the gitter problem is...
        // For large page loads, there's a tenth of a second delay between draw page calls.
        // Because of that, we can't just send the call out and change style sheets, what happens is
        //  -- Update pages (called, not finished)
        //  -- Remove style sheets (happens immediately)
        //  -- Pages still not done drawing...
        //   -   White pages show up in cur page slots.
        //
        // What we've done is pass a callback to the pubbly.updatePage function. Once it's done drawing the pages (after the 10th of a second) we can swap style sheets

        // Custom style attrs removed in puubbly.changeCurPage_dispatch
        _Pubbly.changeCurPage_dispatch(newPage, {
            done: function () {
                _Pubbly.checkPageFor("openPages");
            }
        });
    };

    this.init = function () {
    }
    this.init();
}
