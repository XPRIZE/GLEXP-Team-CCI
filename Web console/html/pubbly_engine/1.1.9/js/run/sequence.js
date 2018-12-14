// Fake superclass cause emca messes scoping

function Sq_Player(type, scopes, callbacks, target) {
    // SUPERS
    const _This = this;
    this._Sequence = scopes[0];
    this._Pubbly = scopes[1];

    // PROPS
    this.logName;
    this.target = target;

    // EVENTS
    // Player loaded and buffered adequately
    this.readied = false;
    this.ready = function () {
        this.readied = true;
        if (this.ready_child) {
            this.ready_child();
        }
        _This.callAll.call(_This, "readied");

    };
    // Audio sounding, animation moving, wait waiting
    this.playing = false;
    // Start the thing
    this.play = function () {
        if (!this.playing) {
            if (this.play_child) {
                this.play_child();
            }
            this.callAll.call(this, "playing");
            this.playing = true;
        }
    };
    // Died on it's own: Audio finished
    this.finished = false;
    this.finish = function () {
        if (!this.finished) {
            this.finished = true;
            this.playing = false;
            if (this.finish_child) {
                this.finish_child();
            }
            this.callAll.call(this, "finished");
        }
    }
    // Shot by sequence: Sequence interrupted, and sequence killed all players
    this.killed = false;
    this.kill = function () {
        if (!this.killed) {
            this.killed = true;
            this.playing = false;
            this.finished = false;
            if (this.kill_child) {
                this.kill_child();
            }
            this.callAll.call(this, "killed");
        }
    };
    // Killed by stranger: Asset didn't load, browser blocked it for some reason
    this.errored = false;
    this.error = function () {
        this.playing = false;
        this.finished = false;
        this.errored = true;
        if (this.error_child) {
            this.error_child();
        }
        _This.callAll.call(_This, "errored");
    }

    // CALLBACKS
    // Fill up the subsequent arrays with 5,10 whatever number functions you want called when it happens
    this.cbs = {
        readied: [],
        playing: [],
        finished: [],
        killed: [],
        errored: []
    };
    // Adds whatever (if any) callbacks the player was initiated with
    for (let c in this.cbs) {
        // If there's a match between a requested callback, and a known good child specific callback...
        if (callbacks && callbacks[c])
            this.cbs[c].push(callbacks[c]);
    }
    // Calls every function in the associated cbs[place]
    this.callAll = function (what) {
        let callBacksToCallBack = this.cbs[what];
        if (callBacksToCallBack.length) {
            for (let c = 0; c < callBacksToCallBack.length; c++) {
                callBacksToCallBack[c].call(this);
            }
        }
    };

    this.postTarget = function () {
        _This._Sequence.postTarget.call(_This._Sequence, _This.target);
    };

    if (Sq_Players_Child[type]) {
        this.buildChild = Sq_Players_Child[type];
        this.buildChild();
    } else {
        error("fatal", "sequence player", "Unknown player subtype of " + type);
    }
}

let Sq_Players_Child = {
    animation: function () {
        const _This = this;

        this.obj = this._Pubbly.find(this.target.chosenDestination, "object");
        this.obj.animations.playing = this.target.value;
        this.obj.animations.at = 0;
        this.obj.animations.end = this.obj.animations[this.target.value].totTime;

        this.play_child = function () {
            this.obj.animations.startTime = now();
            this._Pubbly.redrawDependency.add(this);
            this.animInt = window.setInterval(function () {
                _This.obj.animations.at = now() - _This.obj.animations.startTime;
                if (_This.obj.animations.at > _This.obj.animations.end) {
                    _This.finish();
                }
            }, 10);
        };
        this.finish_child = function () {
            // Stop animated.at++ int func
            window.clearInterval(this.animInt);
            // But end at 100%, just to be sure (skipped frame)
            this.obj.animations.at = this.obj.animations.end;

            // Set end animation props to new object props
            let objProps = this._Pubbly.getRealObjDescription(_This.obj);
            this.obj.height = objProps.height;
            this.obj.width = objProps.width;
            this.obj.loc = [objProps.top, objProps.left];
            this.obj.opacity = objProps.opacity;
            this.obj.layer = objProps.layer;
            this.obj.angle = objProps.angle || 0;

            // Stop object from animating on redraw
            // DO NOT MOVE above the objProps call
            // Not playing objects will revert to whatever their props are
            // We need one last animation prop calc to set those prop.
            // I mean... just don't touch k?
            this.obj.animations.playing = false;
            // Remove from redraw list (will kill redraw if last)
            this._Pubbly.redrawDependency.remove(this);
        };
        this.kill_child = function () {
            // And if no save states?
            window.clearInterval(this.animInt);
            this._Pubbly.redrawDependency.remove(this);
        };

        this.logName = "Animation: " + this.obj.name + " -> " + this.target.value;
    },
    audio: function () {
        const _This = this;

        this.elem = this._Pubbly.pageBuffer.assetListLoaders[this._Pubbly.curPage].byFileName[this.target.chosenDestination].elem;

        this.on_canplay = function () {
            _This.elem.removeEventListener("canplaythrough", _This.on_canplay);
            _This.ready();
        };
        this.on_playing = function () {
            _This.elem.removeEventListener("playing", _This.on_playing);
            _This.play();
        };
        this.on_ended = function () {
            _This.elem.removeEventListener("ended", _This.on_ended);
            _This.finish();
        };
        this.on_error = function () {
            _This.elem.removeEventListener("error", _This.on_error);
            _This.error();
        };

        this.play_child = function () {
            this.elem.volume = this._Pubbly.runtimeProps.masterVolume || 1;
            this.elem.play();
        };
        this.finish_child = function () {
            _This.elem.removeEventListener("ended", _This.on_ended);
            this.elem.preload = false;
            if (this.elem.pause) {
                this.elem.pause();
            }
            this.elem.currentTime = 0;
            // Chrome bug, replays, doesn't pause
            // But only using one aud element... what about the next one?
            // Reloading src will cancel autoplay.
            this.elem.volume = 0;
        }
        this.kill_child = function () {
            this.finish_child();
        }

        this.cbs.readied.push(this.play_child);

        this.elem.addEventListener("canplaythrough", this.on_canplay, false);
        this.elem.addEventListener("playing", this.on_playing, false);
        this.elem.addEventListener("ended", this.on_ended, false);
        this.elem.addEventListener("error", this.on_error, false);

        if (this.elem.readyState == 4) {
            // buffered
            this.on_canplay();
        } else {
            // Load src, events called from listeners
            this.elem.load();
        }

        this.logName = "Audio: " + this.target.chosenDestination;
    },
    flash: function () {
        // Redeclare of scope
        const _This = this;

        // Props
        this.objs = this._Pubbly.findAll(this.target.chosenDestination, "object");
        this.flashInt = 100; // Default
        this.states = [];
        // Props requiring loops to set
        if (this.target.action !== "flashon") {
            error("log", "sequence", "unknown flash action of " + this.target.action + ". Defaulting to flashon");
            this.target.action = "flashon";
        }

        // type flashon -- only type so far
        let last = false;
        if (this.objs[0].vis) {
            this.states.push(false);
        }
        for (let i = 0; i < (this.target.num * 2) - 1; i++) {
            this.states.push(!last);
            last = !last;
        }

        // Extension methods
        this.play_child = function () {
            this.flashInt = window.setInterval(function () {
                let newState = _This.states.shift();
                _This.objs.map(obj => {
                    obj.vis = newState;
                });
                _This._Pubbly.drawPage_dispatch(); // defaults to curPage
                if (!_This.states.length) {
                    _This.finish();
                }
            }, this.target.stateChangeInterval);
        };
        this.finish_child = function () {
            window.clearInterval(this.flashInt);
        };
        this.kill_child = function () {
            window.clearInterval(this.flashInt);
        };

        this.logName = "Flash: " + this.target.chosenDestination;
    },
    gif: function () {
        const _This = this;

        // Interval to redraw thing to can
        this.drawInt = false;
        this.loopsLeft = this.target.loops * 1;

        this.play_child = function () {
            this.elem.currentTime = 0;
            // I think for some browsers the asset needs to actually exist in the DOM
            $("#assetVisitorCenter").append(this.elem);
            // Instead of intervals here (causing multi-int problems), 
            // we make a redrawDep object in the pubbly whatever, 
            // which manages when to redraw, at what framerate, and stuff
            _This._Pubbly.redrawDependency.add(this);
            this.elem.play();
        };
        this.finish_child = function () {
            _This._Pubbly.redrawDependency.remove(this);
            this.elem.pause();
        };
        this.kill_child = function () {
            _This._Pubbly.redrawDependency.remove(this);
            this.elem.pause();
            this.elem.removeEventListener("canPlayThrough", this.on_canplay);
            this.elem.removeEventListener("playing", this.on_playing);
            this.elem.removeEventListener("ended", this.on_ended);
            this.elem.removeEventListener("error", this.on_error);
        }

        this.on_canplay = function () {
            _This.elem.removeEventListener("canPlayThrough", _This.on_canplay);
            _This.play();
        };
        this.on_ended = function () {
            _This.elem.removeEventListener("ended", _This.on_ended);
            _This.loopsLeft--;
            if (!_This.loopsLeft) {
                _This.finish();
            } else {
                this.currentTime = 0;
                this.play();
            }
        };
        this.on_error = function (err) {
            _This.elem.removeEventListener("error", _This.on_error);
            _This.error();
        };

        // link to asset video
        this.elem = this._Pubbly.buffer.assets[this.target.chosenDestination + ".mp4"].elem;
        this.elem.addEventListener("canplaythrough", this.on_canplay, false);
        this.elem.addEventListener("ended", this.on_ended, false);
        this.elem.addEventListener("error", this.on_error, false);

        this.logName = "Gif: " + this.target.chosenDestination;
    },
    sequence: function () {
        const _This = this;

        this.drawInt = false;
        this.loopsLeft = this.target.loops * 1;
        this.obj = _This._Pubbly.find(this.target.chosenDestination, "object");
        this.obj.at = 0;
        this.frames = this.obj.frames;
        this.framerate = this.target.framerate;

        this.play_child = function () {
            _This._Pubbly.redrawDependency.add(this);
            _This.drawInt = window.setInterval(function () {
                if (_This.obj.at + 2 > _This.frames.length) {
                    _This.loopsLeft--;
                    if (_This.loopsLeft > 0) {
                        _This.obj.at = 0;
                    } else {
                        let endSequenceOnFirstFrame = true;
                        if (endSequenceOnFirstFrame) {
                            _This.obj.at = 0;
                        }
                        _This.finish();
                    }
                } else {
                    _This.obj.at++;
                }
            }, 1000 / _This.framerate);
        };
        this.finish_child = function () {
            window.clearInterval(_This.drawInt);
            _This._Pubbly.redrawDependency.remove(_This);
        };
        this.kill_child = function () {
            window.clearInterval(_This.drawInt);
            _This._Pubbly.redrawDependency.remove(_This);
        }

        this.logName = "Img Sequence: " + this.target.chosenDestination;
    },
    wait: function () {
        const _This = this;

        this.timeout = window.setTimeout(function () {
            _This.finish();
        }, this.target.chosenDestination * 1000);

        this.finish_child = function () {
            window.clearTimeout(this.timeout);
        };
        this.kill_child = function () {
            window.clearTimeout(this.timeout);
        };

        this.logName = "Wait: " + this.target.chosenDestination * 1000;
    },
    video: function () {
        const _This = this;
        this.obj = this._Pubbly.find(this.target.chosenDestination, "video");
        this.elem = this._Pubbly.pageBuffer.assetListLoaders[this._Pubbly.curPage].byFileName[this.obj.fileName].elem;
        
        this.kill_child = function () {
            this.elem.pause();
            this.elem.currentTime = 0;
        }
        
        this._Pubbly.redrawDependency.add(this);
        this.on_canplay = function () {
            _This.elem.removeEventListener("canplaythrough", _This.on_canplay);
            _This.elem.play();
        };
        this.on_playing = function () {
            _This.elem.removeEventListener("playing", _This.on_playing);
            _This.elem.volume = 1;
            _This.play();
        };
        this.on_ended = function () {
            _This.elem.removeEventListener("ended", _This.on_ended);
            _This.elem.currentTime = 0;
            _This.elem.volume = 0;
            _This.finish();
        };
        this.on_error = function () {
            _This.elem.removeEventListener("error", _This.on_error);
            _This.error();
        };
        this.elem.addEventListener("canplaythrough", this.on_canplay, false);
        this.elem.addEventListener("playing", this.on_playing, false);
        this.elem.addEventListener("ended", this.on_ended, false);
        this.elem.addEventListener("error", this.on_error, false);
        if (this.elem.readyState === 4) {
            // buffered
            this.on_canplay();
        } else {
            // Load src, events called from listeners
            this.elem.load();
        }
    }
};

function Sequence(pubblyScope) {
    const _Pubbly = pubblyScope;
    const _Sequence = this;

    // Debugging
    this.show = _Pubbly.runtimeProps.showSequence || false; // Log each target as it hits.
    this.running = false;
    this.players = {
        waits: [],
        audios: [],
        animations: [],
        flashes: [],
        gifs: [],
        sequences: [],
        countdowns: [],
        videos: [],
        // TODO:
        // new Video(),
        // new Highlighter(),
        // new Recorder(),
    };

    this.targets = [];
    this.nextTarget = function () {
        if (this.running) {
            let target = this.targets.shift(); // sets target, removes from targets
            if (target) {
                this.preTarget(target);
            } else {
                // Last target
                let lastTarget = {
                    hold: "all",
                    type: "finishSequence",
                }
                this.preTarget(lastTarget);
            }
        }
    }
    this.preTarget = function (target) {
        if (target.hold) {
            this.waitFor(target, target.hold, function () {
                this.runTarget(target);
            });
        } else {
            this.runTarget(target);
        }
    }
    this.runTarget = function (target) {
        target.chosenDestination = target.destination;
        if (target.random) {
            let options = target.random.options.slice();
            /* Can only send clicks to enabled links  
             * Meaning, slice the random list
             * filter for enabled
             * choose from that
             * if the filtered enabled list is empty, repopulate
             * BUT repopulate with the original option list
             * (Even though some options might still be disabled (currently))
             * 
             * To my knowledge, no other "random" requires a filter check.
             */
            if (target.type === "send") {
                options = options.filter(linkName => _Pubbly.find(linkName, "link").enabled);
            }
            if (options.length === 0) {
                console.warn("All links in random send list are disabled");
                target.type = "skip";
                // Don't know where to find this value in XML, so defaulting to true
            } else {
                let num = rand(options.length - 1);
                target.chosenDestination = options[num];
                if (target.random.removeChoice) {
                    let at = target.random.options.indexOf(target.chosenDestination);
                    target.random.options.splice(at, 1);
                    let resetOnRandomEmpty = true;
                    // If here, we've chosen a target. 
                    // If there was only one to choose from, the random array is effectively empty
                    // Effectively because some links might still be in there but they're disabled so they don't count.
                    if (options.length === 1 && resetOnRandomEmpty) {
                        target.random.options = target.random.init.options.slice();
                    }
                }
            }
        }

        let autoPost = true;
        let autoDraw = false;
        let obj = false;
        if (this.show || true) {
            console.log("" + JSON.stringify(target));
        }
        let targType = target.type;
        if (typeof target.run !== "undefined") {
            if (target.run >= target.runLimit) {
                targType = "skip";
            } else {
                target.run++;
            }
        }

        switch (targType) {
            case "drawing tool":
                let tool = {
                    type: target.chosenDestination,
                    color: target.value,
                    width: target.width,
                    height: target.height
                };
                _Pubbly.drawingTools.change(tool);
                break;
            case "animation":
                let animation = new Sq_Player(
                        "animation",
                        [_Sequence, _Pubbly],
                        {},
                        target
                        );
                target.player = {
                    name: "animations",
                    loc: this.players.animations.length
                };
                this.players.animations.push(animation);
                animation.play();
                break;
            case "audio":
                // DO NOT go to next target as soon as CALLED
                autoPost = false;
                // Audios have to load (half second maybs), then play(), then post

                // Custom cbs... Only move on to next...
                // When audio STARTS/ERRS (0.5s depending on load time)
                let aud = new Sq_Player(
                        "audio",
                        [_Sequence, _Pubbly],
                        {
                            playing: function () {
                                this.postTarget();
                            },
                            error: function () {
                                this.postTarget();
                            },
                        },
                        target
                        );
                target.player = {
                    name: "audios",
                    loc: this.players.audios.length
                };
                this.players.audios.push(aud);
                break;
            case "video":
                // DO NOT go to next target as soon as CALLED
                autoPost = false;
                // Audios have to load (half second maybs), then play(), then post

                // Custom cbs... Only move on to next...
                // When audio STARTS/ERRS (0.5s depending on load time)
                let vid = new Sq_Player(
                        "video",
                        [_Sequence, _Pubbly],
                        {
                            playing: function () {
                                this.postTarget();
                            },
                            error: function () {
                                this.postTarget();
                            },
                        },
                        target
                        );
                target.player = {
                    name: "videos",
                    loc: this.players.videos.length
                };
                this.players.videos.push(vid);
                break;
            case "flash":
                obj = _Pubbly.find(target.chosenDestination, "object");
                if (obj) {
                    let flash = new Sq_Player(
                            "flash",
                            [_Sequence, _Pubbly],
                            {},
                            target
                            );
                    target.player = {
                        name: "flashes",
                        loc: this.players.flashes.length
                    };
                    this.players.flashes.push(flash);
                    // MAYBE window.setTimeout(function() {flash.play()},1) to ensure finished handlers don't get skipped when bad flash times are set to 0????????
                    flash.play();
                }
                break;
            case "log":
                if (typeof console[target.action] == "function") {
                    console[target.action]("SEQUENCE LOG: " + target.value);
                } else if (target.action == "alert") {
                    window.alert("SEQUENCE ALERT: " + target.value);
                } else {
                    console.log("LOG: " + target.value);
                }
                break;
            case "send":
                // IDEA: Send passive - new Sequence, or Send blocking - adds targets to same sequence
                target.passive = false;
                let targets = false;
                let linkLoc = _Pubbly.data;
                let link = _Pubbly.find(target.chosenDestination, "link");
                if (link && link.triggers[plurals[target.action]] && link.enabled) {
                    if (target.action == "click") {
                        targets = link.triggers[plurals[target.action]][0].targets;
                    } else if (target.action == "dragStop") {
                        // TODO: Send drop to...
                    }
                }
                if (targets) {
                    this.addTargets(targets);
                } else {
                    error("log", "sequence", "No targets to add");
                }
                break;
            case "point":
                autoDraw = true;
                let localCheck = _Pubbly.data.pages[_Pubbly.curPage].points;
                let globalCheck = _Pubbly.data.points;
                let pointLoc;

                if (typeof localCheck[target.chosenDestination] == "undefined"
                        && typeof globalCheck[target.chosenDestination] == "undefined") {
                    // All points now created from the PointNames node in the XML.js script file.
                    console.log("warn", "sequence", "Uninitiated point value");
                    // _Pubbly.data.pages[_Pubbly.curPage].points[target.chosenDestination] = 0;
                } else {
                    // Small scope first.
                    pointLoc = (typeof localCheck[target.chosenDestination] == "undefined")
                            ? globalCheck : localCheck;
                    // Don't know what we used the chaged thing for...
                    if (pointLoc.changed.indexOf(target.chosenDestination) === -1) {
                        pointLoc.changed.push(target.chosenDestination);
                    }
                    switch (target.action) {
                        case "+":
                            pointLoc[target.chosenDestination] += target.value;
                            break;
                        case "-":
                            pointLoc[target.chosenDestination] -= target.value;
                            break;
                        case "*":
                            pointLoc[target.chosenDestination] *= target.value;
                            break;
                        case "/":
                            pointLoc[target.chosenDestination] /= target.value;
                            break;
                        case "=":
                            pointLoc[target.chosenDestination] = target.value;
                            break;
                        default:
                            autoDraw = false;
                            error("log", "Sequence", "Unknown point modification of " + target.action);
                            // Unused for now.
                            // pointLoc.changed.pop(); // Easier than doing a push inside all GOOD point mods
                            break;
                    }
                }

                break;
            case "finishSequence":
                this.finish();
                break;
            case "propertyChange":
                // Might be do 1 thing to 10 links/objects
                // Might be do 1 thing to a randomly chosen 1 lins/object
                // Might be do 1 thing to 1 link/object.
                let things = [];

                if (target.destination === "all links") {
                    // Every link
                    things = _Pubbly.data.pages[_Pubbly.curPage].links;
                } else if (target.destination === "all objects") {
                    things = _Pubbly.data.pages[_Pubbly.curPage].objs;
                } else {
                    // Check pop cause strings have length
                    if (typeof target.destination.pop === "undefined") {
                        if (target.chosenDestination !== target.destination) {
                            // Destination selected at random
                            things = [target.chosenDestination];
                        } else {
                            // Vanilla single thing destination
                            things = [target.destination];
                        }
                    } else {
                        // Array of destinations
                        things = target.destination.slice();
                    }
                }
                let foundList = [];
                // ["ball 1"] but ball 1 has a clone...
                things.map(thing => {
                    let things = false;
                    if (typeof thing === "object") {
                        things = _Pubbly.findAll(thing);
                    } else {
                        things = _Pubbly.findAll(thing, target.destinationType);
                    }
                    if (things) {
                        foundList = foundList.concat(things);
                    }
                });
                for (let t = 0; t < foundList.length; t++) {
                    let thing = foundList[t];
                    if (typeof thing[target.attribute] !== "undefined") {
                        // TODO: either a setter that checks types, or a manual type check here.
                        thing[target.attribute] = target.value;
                    } else {
                        // List of known more complicated types
                        if (target.attribute === "center" && target.destinationType === "object") {
                            // Need to get actual height and width (animations, offsets, drops, swaps)
                            // Function stored in pubbly, used mostly for redraw
                            let objDesc = _Pubbly.getRealObjDescription(thing);
                            // Object locs are in top,left
                            // Centers are in X, Y
                            thing.loc = [
                                // top
                                target.value.y - (objDesc.height / 2),
                                // left
                                target.value.x - (objDesc.width / 2)
                            ];
                            if (thing.droppedLoc) {
                                delete thing.droppedLoc;
                            }
                        } else {
                            console.error("Unknown " + target.destinationType +
                                    "property of " + target.attribute);
                        }
                    }
                }

                // For the (Set prop but don't make it take effect until the next sequence target
                if (target.autoDraw !== false) {
                    autoDraw = true;
                }
                break;
            case "gif":
                obj = _Pubbly.find(target.chosenDestination, "object");
                if (obj) {
                    let gif = new Sq_Player(
                            obj.type, // Either GIF or SEQUENCE
                            [_Sequence, _Pubbly],
                            {},
                            target
                            );
                    target.player = {
                        name: "gifs",
                        loc: this.players.gifs.length
                    };
                    this.players[plurals[obj.type]].push(gif);
                    gif.play();
                }
                break;
            case "wait":
                if (target.blocking == "waits") {
                    let wait = new Sq_Player(
                            "wait",
                            [_Sequence, _Pubbly],
                            {},
                            target
                            );
                    target.player = {
                        name: "waits",
                        loc: this.players.waits.length
                    };
                    this.players.waits.push(wait);
                    wait.play();
                } else {
                    // Simply passes player arr to wait for in the target.blocking prop
                }
                break;
            case "countdown":
                if (typeof _Pubbly.countdown[target.action] === "function") {
                    _Pubbly.countdown[target.action](target.value);
                } else {
                    console.error("Unknown countdown target action " + target.action);
                }
                // Redraws value, checks for > 0, starts countdown related sequence if
                // _Pubbly.countdown.check();
                break;
            case "reset":
                autoDraw = true;
                let resetType = target.action.split(" ")[0];
                let searchStarts = [];
                if (resetType == "object") {
                    searchStarts = _Pubbly.findAll(target.destination, "object");
                } else if (resetType == "link") {
                    searchStarts = _Pubbly.findAll(target.destination, "link");
                } else if (resetType == "page") {
                    searchStarts = [_Pubbly.data.pages[_Pubbly.curPage]];
                }

                let reset = function (level) {
                    // If it's got an init, reset all props declared in init. If it's an object itself, recursively loop into it.
                    let init = level.init;
                    for (let prop in level) {
                        if (init && typeof init[prop] !== "undefined") {
                            level[prop] = dupeAnyType(init[prop]);
                        } else if (typeof level[prop] === "object" &&
                                // null is type object... Shouldn't have any... but failsafe
                                level[prop] !== null) {
                            if (level.constructor.name === "Object" || level.constructor.name === "Array") {
                                /* Means it was generated programatically
                                 * (let thing = {};
                                 * (thing.stuff = "string";)
                                 * NOT constructed
                                 * (new Audio(); new Workspace())
                                 */
                                reset(level[prop]);

                            }
                        }
                    }
                };
                searchStarts.map(s => reset(s));
                // Clones? {markedForDeletion: false, init: {markedForDeletion = true}};
                // Resetting clones marks them for deletion (at start search level), and then we...
                // Workspaces? {clear:false, init: {clear:true}}
                // In redraw, if workspace.clear, elem.width = elem.width
                // Since autoDraw, workspace is cleared
                _Pubbly.clearClones();

                break;
            case "navigation":
                if (target.action == "navigate") {
                    if (target.destination == "pubbly") {
                        if (target.attribute == "relative") {
                            if (target.value == "next") {
                                _Pubbly.turns.handlers.auto.right();
                            } else if (target.value == "previous") {
                                _Pubbly.turns.handlers.auto.left();
                            } else {
                                error("warn", "sequence", "Unknown navigation value: " + target.value);
                            }
                        } else if (target.attribute == "absolute") {
                            _Pubbly.updatePage.call(_Pubbly, target.value);
                        } else {
                            error("warn", "sequence", "Unknown navigation attribute: " + target.attribute);
                        }
                    } else if (target.destination == "browser") {
                        // target.attribute == "popup/tab/window"
                        _Pubbly.urlNav.go(target.value, target.attribute);
                    }
                }   // else... I dunno, history clear?
                break;
            case "info":
                let change = true;
                if (target.action == "set" && _Pubbly.data.info[target.destination]) {
                    _Pubbly.data.info[target.destination] = target.value;
                    if (target.destination == "navigation") {
                        if (target.value) {
                            _Pubbly.navigationUI.show();
                        } else {
                            _Pubbly.navigationUI.hide();
                        }
                    }
                } else {
                    console.warn("Unknown set type: ");
                    console.warn("" + JSON.stringify(target));
                }
                break;
            case "skip":
                break;
            default:
                console.warn("Unknown target: ");
                console.warn("" + JSON.stringify(target));
                break;
        }

        if (autoDraw) {
            _Pubbly.drawPage_dispatch();
        }
        if (autoPost) {
            this.postTarget(target);
        }
    }
    this.postTarget = function (target) {
        if (window.testing && target.id == _Pubbly.runtimeProps.stopAtTarget) {
            console.warn("stopAtTarget set and met. HODLING!!");
        } else if (target.blocking) {
            this.waitFor(target, target.blocking, function () {
                this.nextTarget();
            });
        } else {
            this.nextTarget();
        }
    }
    this.waitFor = function (target, what, cb) {
        let waits = this.getPlayers(what);

        function waitSingle(what, cb) {
            let waits = 0;

            function finished() {
                waits--;
                if (waits <= 0) {
                    cb.call(_Sequence);
                }
            }

            let waitLog = "Waiting for ";
            if (this.players[what]) {
                for (let w = 0; w < this.players[what].length; w++) {
                    if (!this.players[what][w].finished) {
                        waits++;
                        this.players[what][w].cbs.finished.push(finished);
                        waitLog += this.players[what][w].logName + ", ";
                    }
                }
            } else if (what == "self") {
                if (target.player && !target.player.finished) {
                    waits++;
                    this.players[target.player.name][target.player.loc].cbs.finished.push(finished);
                    waitLog += "self, ";
                }
            } else {
                error("log", "sequence", "Unknown wait of " + what + ", skipping.");
            }
            if (waits == 0) {
                cb.call(_Sequence);
            } else if (this.show) {
                console.log(waitLog);
            }

        }

        let nextWait = function () {
            let cur = waits.shift();
            if (cur) {
                waitSingle.call(this, cur, nextWait);
            } else {
                cb.call(this);
            }
        }
        nextWait.call(this);
    }
    this.getPlayers = function (what) {
        let ret = [];

        if (typeof what == "object") {
            for (let w = 0; w < what.length; w++) {
                if (this.players[what[w]]) {
                    ret.push(what[w]);
                } else if (what[w] == "self") {
                    ret.push("self");
                } else {
                    console.error("Unknown player type " + what[w]);
                }
            }
        } else if (what == "all") {
            for (let player in this.players) {
                ret.push(player);
            }
        } else {
            if (this.players[what] !== "undefined") {
                ret = [what];
            }
        }

        if (ret.length == 0) {
            // Unknown wait, call back
            console.error("Unknown wait of " + what + ", calling back immediately");
        }
        return ret;
    }

    this.startNew = function (link, trigger, loc) {
        if (this.running) {
            this.kill();
        }
        trigger.run++;
        this.start(link, trigger, loc);
    };
    this.start = function (caught) {
        if (_Pubbly.ready) {
            if (_Pubbly.data.info.interrupt === false) {
                _Pubbly.navigationUI.disable();
            }

            let link = caught.link;
            let action = caught.action;
            let loc = caught.loc;
            if (this.show) {
                console.log(link.name + " starting");
            }
            let targets = link.triggers[action][loc].targets;
            if (targets) {
                this.addTargets(targets);
                this.running = true;
                this.nextTarget();
            } else {
                console.error("Bad stuff check here");
            }
        } else {
            console.info("Triggered sequence but pubbly not loaded... ignored");
        }
    };
    this.addTargets = function (targets) {
        for (let t = 0; t < targets.length; t++) {
            this.targets.push(targets[t]);
        }
    };


    this.finish = function () {
        if (_Pubbly.runtimeProps.saveStates) {
            _Pubbly.states.save();
        }
        _Pubbly.navigationUI.enable();
        this.kill_players();
        // Empty targets
        this.targets = [];
        if (this.show) {
            console.log(" -- Sequence finished -- ");
        }

        // Why are we hiding behind a milli timeout like a little bitch?
        // Because occasionally, one some books, callbacks from finished animations a sequence ago will leak through to the next sequence.
        // And it's been a long night, so this fixes it don't ask questions.
        window.setTimeout(function () {
            // Check for any page point matches in order to trigger logic links
            _Pubbly.checkPageFor("points");
        }, 1);
    };
    this.kill = function () {
        this.kill_players();
        this.targets = [];

        // Even interrupted sequences check for point match links
        _Pubbly.checkPageFor("points");
    };
    this.kill_players = function () {
        let stops = this.getPlayers("all");
        this.running = false;
        for (let pt in stops) {
            let player = stops[pt];
            for (let p = 0; p < this.players[player].length; p++) {
                if (this.players[player][p].playing) {
                    this.players[player][p].kill();
                }
                this.players[player][p] = null;
                delete this.players[player][p];
            }
            this.players[player] = [];
        }
    };

    this.init = function () {

    };
    this.init();
}