var curSequence = false, minimumHighlightTimerAct;

if (window.testing) {
    showsequence = true;
}
function sequence(list, elem, linkName, relPos, triggerType) {
    logSecStamp("sequence constructor called");
    book.analytics.add({type: "st", linkname: linkName});
    if (showsequence) {
        console.log("Sequence log: " + "New sequence -- " + linkName + " type " + triggerType);
    }
    var THIS = this;
    this.running = true;
    // current page object in book
    this.pageElem = elem;
    // boolean, NOTE not sure if we need this
    this.inList = true;
    // Increment for sequence list,
    this.listNum = -1;
    // List array
    this.listArr = JSON.parse(JSON.stringify(list)); // break any link to original ref
    // Any opened animation intervals, for clearing or waiting for "animation ended" event
    // NOTE Can switch to array if needed, but for the time being, the books only support one animation at a time.
    this.openAnims = 0;
    this.objectsAnimating = [];
    // Any opened and ticking waits, CAN ONLY HAVE ONE AT A TIME
    this.openWait = false;
    // Override for clearing sequence, only used for enabling recorder.
    this.holdClear = false;
    this.triggerType = triggerType;
    this.linkName = linkName;


    var triggerType, linkPos;
    try {
        triggerType = this.pageElem.linkKey[this.linkName].type;
        this.linkActual = this.pageElem[triggerType][linkPos];
        linkPos = this.pageElem.linkKey[this.linkName].pos;
    } catch (e) {

    }


    // Audio props for local export
    this.openAudio = false;
    this.openVideo = false;
    this.playCheck = false;
    this.videoRefresh = false;
    this.openFlash = false;
    this.flashInt = false;
    this.logicDone = false;

    // Highlighter props
    this.openHighlight = false;
    this.parentHighlight = false;

    minimumHighlightTimer = false;
    window.clearTimeout(minimumHighlightTimerAct);
    minimumHighlightTimerAct = window.setTimeout(function () {
        if (!THIS.running) {
            THIS.pageElem.highlightedLink = false;
            THIS.pageElem.redraw();
        }
        THIS.minimumHighlightTimer = true;
    }, book.minLinkHighlightTime);

    if (this.listArr.length > 1000) {
        console.warn("Bug: " + "Sequence problem: You can only have 1000 targets in a sequence. 201 and above will not play.");
        this.listArr[t].splice(1000, this.listArr[t].length);
    }

    var eventualLinkStatuses = {};
    var at = 0;
    var curTarg = this.listArr[at];
    var whileBreak = 1000; // loop only iterates 10,000 times. That's enough right?
    while (curTarg && whileBreak && this.listArr.length < 1000) {
        whileBreak--;
        if (curTarg[1].toLowerCase() == "enable" || curTarg[1].toLowerCase() == "disable") {
            var what = curTarg[2];
            var mults = what.split(',');
            if (THIS.pageElem.linkKey[what]) {
                var stat = curTarg[1].toLowerCase() == "enable";
                eventualLinkStatuses[what] = stat;
            } else if (mults.length > 1) {
                for (var m = 0; m < mults.length; m++) {
                    if (THIS.pageElem.linkKey[mults[m]]) {
                        var stat = curTarg[1].toLowerCase() == "enable";
                        eventualLinkStatuses[mults[m]] = stat;
                    }
                }
            }
        } else if (curTarg[0].toLowerCase() == "object" && curTarg[1].toLowerCase() == "reset" && curTarg[2].toLowerCase() == "page") {
            for (var key in THIS.pageElem.linkKey) {
                var link = THIS.pageElem.linkKey[key];
                var origStatus = THIS.pageElem[link.type][link.pos].initEnabled;
                eventualLinkStatuses[key] = origStatus;
            }
        } else if (curTarg[1].toLowerCase() == "send click to") {
            var sendLink = curTarg[2];
            var addedTargs = 1;
            // this.listArr.splice(at, 1); // delete send to link
            var targetsToAdd = [];

            var linkName;
            function arraysEqual(arr1, arr2) {
                for (var l = 0; l < arr1.length; l++) {
                    if (arr1[l] !== arr2[l]) {
                        return false;
                    }
                }
                return true;
            }
            if (sendLink.isFunction) {
                linkName = false;
                if (sendLink.args.length > 0) {
                    var pullTarg = false;
                    // Find the first mention of this specific chooseAndRemove link
                    for (var t = 0; t < this.listArr.length; t++) {
                        var targ = this.listArr[t];
                        if (targ[1] == "send click to" && targ[2].isFunction &&
                          (targ[2].functionType == "chooseAndRemove" || targ[2].functionType == "choose") &&
                          arraysEqual(targ[2].initArgs, sendLink.initArgs)) {
                            // THIS is the original link, and THIS is what we'll delete arguments from
                            pullTarg = targ[2];
                            t = this.listArr.length;

                            var sendClickLinkArr = [];
                            for (var tg = 0; tg < pullTarg.args.length; tg++) {
                                var curStatus = THIS.pageElem.clicks[THIS.pageElem.linkKey[pullTarg.args[tg]].pos].enabled;
                                var linkEnabled = false;

                                // If, for some stupid reason, we don't have an eventual status, use the init.
                                if (typeof (eventualLinkStatuses[pullTarg.args[tg]]) == "undefined") {
                                    linkEnabled = curStatus;
                                } else { // otherwise, use eventual.
                                    linkEnabled = eventualLinkStatuses[pullTarg.args[tg]];
                                }

                                if (linkEnabled) {
                                    sendClickLinkArr.push(pullTarg.args[tg]);
                                }
                            }

                            var rand = Math.floor(Math.random() * sendClickLinkArr.length);
                            linkName = sendClickLinkArr[rand];

                            if (targ[2].functionType == "chooseAndRemove") {
                                // Remove choice from book master.
                                targ[2].args.splice(rand, 1);
                                if (targ[2].args.length == 0 && book.resetRandomRemovals) {
                                    targ[2].args = (targ[2].initArgs).slice(0);
                                }
                            }
                        }
                    }


                    /*
                     if (sendLink.functionType == "chooseAndRemove") {
                     // Remove choice from book master.
                     THIS.linkActual.targets[at][2].args.splice(rand, 1);
                     if (curTarg[2].args.length == 0 && book.resetRandomRemovals) {
                     curTarg[2].args = (curTarg[2].initArgs).slice(0);
                     }
                     }
                     */
                }
            } else {
                linkName = sendLink;
            }

            if (linkName) {
                var linkInfo = THIS.pageElem.linkKey[linkName];
                var linkAct = THIS.pageElem[linkInfo.type][linkInfo.pos];
                if (linkAct.enabled || eventualLinkStatuses[linkName]) {
                    targetsToAdd = linkAct.targets;
                }



                for (var i = 0; i < targetsToAdd.length; i++) {
                    var target = targetsToAdd[i];
                    this.listArr.splice(at + addedTargs, 0, target); // splice in all new targets
                    addedTargs++;
                }
            } else {
                // No link name? Add Don't add anything.
            }




            /*
             if (sendLink.isFunction) {
             if (sendLink.args.length > 0) {
             var rand = Math.floor(Math.random() * sendLink.args.length);
             links = sendLink.args[rand];
             if (sendLink.functionType == "chooseAndRemove") {
             // Remove choice from book master.
             THIS.linkActual.targets[at][2].args.splice(rand, 1);
             if (curTarg[2].args.length == 0 && book.resetRandomRemovals) {
             curTarg[2].args = (curTarg[2].initArgs).slice(0);
             }
             }
             }
             }
             */
        }
        at++;
        curTarg = this.listArr[at];
    }
//     console.log(this.listArr);

    this.finalLogicTargets = [];
    this.addRecorder = false;
    var targetCount = 0;
    for (var t = 0; this.listArr[t]; t++) {
        targetCount++;
        if (targetCount > 1000) {
            t = -1; // break loop
            console.warn("Error: " + "Sequence problem: You can only have 1000 targets in a sequence. Problem probably because you have two sequences which send clicks to each other, infinite loop style.");
        } else {
            if (this.listArr[t][0]) {
                if ((this.listArr[t][0].toLowerCase() == "logic" || this.listArr[t][0].toLowerCase() == "points")) {
                    this.finalLogicTargets.push(this.listArr[t]);
                    this.hadLogicLinks = true;
                } else if (this.listArr[t][1].toLowerCase().split(" ")[0] == "overwrite") {
                    this.addRecorder = true;
                }
            }
        }
    }


    this.nextCheck = function () {
        var next = THIS.listArr[THIS.listNum + 1];
        if (next) {
            return next[0].toLowerCase();
        } else {
            return 'end of sequence';
        }
    };

    this.next = function () {
        if (THIS.running) {
            THIS.listNum++;
            var curTarg = THIS.listArr[THIS.listNum];
            if (curTarg && curTarg[0]) {
                var targType = curTarg[0].toLowerCase();
                var targAction = curTarg[1].toLowerCase();
                var targDest = curTarg[2];

                // book.analytics.add({type: "target", target: {type: targType, action: targAction, destination: targDest}});
                if (showsequence) {
                    console.log("Sequence log: " + curTarg);
                }
                var functionPass = true;
                if (targDest.isFunction) {
                    if (targDest.functionType == "chooseAndRemove" || targDest.functionType == "choose") {
                        if (targAction !== "send click to") {
                            if (targDest.args.length > 0) {
                                var rand = Math.floor(Math.random() * targDest.args.length);
                                var destination = targDest.args[rand];
                                if (targDest.functionType == "chooseAndRemove") {
                                    // Remove choice from book master.
                                    THIS.linkActual.targets[THIS.listNum][2].args.splice(rand, 1);
                                    if (curTarg[2].args.length == 0 && book.resetRandomRemovals) {
                                        curTarg[2].args = (curTarg[2].initArgs).slice(0);
                                    }
                                }
                                targDest = destination;
                            } else {
                                console.warn("Sequence problem: Ran out of arguments for random choice.");
                                functionPass = false;
                            }
                        } else {
                            // send click to being handled in pre-execution shit above.
                        }
                    } else {
                        console.warn("Bug: " + "Sequence problem: Unknown function type of <b>" + targDest.functionType + "</b>. Event skipped");
                        functionPass = false;
                    }
                }
                if (functionPass) {
                    if (targType == "object") {
                        var splitTarg = targAction.split('|');
                        // objects
                        if (targAction == "show" || targAction == "hide") {
                            // show hide obj
                            showHide(targDest, targAction, true);
                        } else if (splitTarg[0] == "play" || splitTarg[0] == "play blocking" || splitTarg[0] == "play passive") {
                            // animate obj
                            var objName = targDest.split("|")[0];
                            var objLoc = THIS.pageElem.objs[objName];
                            var animName = targDest.split("|")[1];
                            if (curTarg[2].isFunction) {
                                objLoc = THIS.pageElem.objs[curTarg[2].referenceObject];
                                animName = targDest;
                            }
                            if (objLoc.type == 'image') {
                                // static object animation
                                animateObject(objLoc, animName, splitTarg[0]);
                            } else if (objLoc.type == 'video') {
                                // playing a video
                                playVideo(objLoc);
                            } else {
                                console.warn("Bug: " + 'Sequence problem: Unknown object type <b>' + objLoc.type + '</b> in object ' + objLoc.name);
                                THIS.next();
                            }
                        } else if (targAction == "reset") {
                            resetObject(targDest);
                        } else if (targAction.toLowerCase() == 'send click to') {
                            // Targets in sendClickTo link have already been added, so ignore and continue.

                            THIS.next();
                            /*
                             // THIS.complete(); // this.end() will clear, this.complete() will save the state, then clear.
                             var sendLink = targDest;
                             var linkInfo = THIS.pageElem.linkKey[sendLink];
                             if (linkInfo) {
                             var linkAct = THIS.pageElem[linkInfo.type][linkInfo.pos];
                             if (linkAct.enabled) {
                             // curSequence = new sequence(linkAct.targets, THIS.pageElem, sendLink, relPos, "click");
                             // curSequence.start();
                             } else {
                             console.warn("Bug: " + "Sequence problem: Can't send a click to a disabled link.");
                             }
                             } else {
                             // link doesn't exist.
                             }
                             */
                        } else if (targAction == 'enable' || targAction == 'disable') {
                            if (targDest.toLowerCase() == "all links") {
                                // NOT ACTUALLY all links. Just non-conditional links.
                                var bool = (targAction == 'enable') ? true : false;
                                for (var c = 0; c < THIS.pageElem.clicks.length; c++) {
                                    THIS.pageElem.clicks[c].enabled = bool;
                                }
                                for (var d = 0; d < THIS.pageElem.drops.length; d++) {
                                    THIS.pageElem.drops[d].enabled = bool;
                                }
                                for (var le = 0; le < THIS.pageElem.lineEnds.length; le++) {
                                    THIS.pageElem.lineEnds[le].enabled = bool;
                                }
                                for (var ls = 0; ls < THIS.pageElem.lineStarts.length; ls++) {
                                    THIS.pageElem.lineEnds[ls].enabled = bool;
                                }
                                THIS.next();
                            } else {
                                var lnkInKey = THIS.pageElem.linkKey[targDest];
                                var wkspInKey = THIS.pageElem.workspaceKey[targDest];
                                if (lnkInKey && (typeof lnkInKey == "number" || typeof lnkInKey.pos == "number")) { // Check if we have a link to enable/disable
                                    var lnkType = lnkInKey.type;
                                    var lnkPos = lnkInKey.pos;
                                    var lnkTypeArr = THIS.pageElem[lnkType];
                                    if (lnkTypeArr) {
                                        var lnkAct = lnkTypeArr[lnkPos];
                                        if (lnkAct) {
                                            // enable or disable
                                            if (targAction == 'enable') {
                                                lnkAct.enabled = true;
                                            } else {
                                                lnkAct.enabled = false;
                                            }
                                            THIS.next();
                                        } else {
                                            console.warn("Bug: " + "Sequence problem: link <b>" + targDest + "</b> not found in <b>" + lnkType + "</b>");
                                            THIS.next();
                                        }
                                    } else {
                                        console.warn("Bug: " + "Sequence problem: unknown link type <b>" + lnkType + "</b>");
                                        THIS.next();
                                    }
                                } else if (typeof wkspInKey == "number") { // No link? Maybe it's a workspace
                                    if (THIS.pageElem.workspaces[wkspInKey]) {
                                        if (targAction == 'enable') {
                                            THIS.pageElem.workspaces[wkspInKey].enabled = true;
                                        } else {
                                            THIS.pageElem.workspaces[wkspInKey].enabled = false;
                                        }
                                    } else {
                                        console.warn("Bug: " + "Sequence problem: Workspace <b>" + targDest + "</b> not found on page");
                                    }
                                    THIS.next();
                                } else { // No link or workspace? Maybe it's a comma del list of links
                                    var links = targDest.split(',');
                                    if (links.length > 0) {
                                        for (var l = 0; l < links.length; l++) {
                                            var link = links[l];
                                            var lnkInKey = THIS.pageElem.linkKey[link];
                                            if (lnkInKey) {
                                                var lnkType = lnkInKey.type;
                                                var lnkPos = lnkInKey.pos;
                                                var lnkTypeArr = THIS.pageElem[lnkType];
                                                if (lnkTypeArr) {
                                                    var lnkAct = lnkTypeArr[lnkPos];
                                                    if (lnkAct) {
                                                        // enable or disable
                                                        if (targAction == 'enable') {
                                                            lnkAct.enabled = true;
                                                        } else {
                                                            lnkAct.enabled = false;
                                                        }
                                                    } else {
                                                        console.warn("Bug: " + "Sequence problem: link <b>" + targDest + "</b> not found in <b>" + lnkType + "</b>");
                                                    }
                                                }
                                            } else {
                                                console.warn("Bug: " + "Sequence problem: No such link <b>" + targDest + "</b>");
                                            }

                                        }
                                        THIS.next();
                                    } else { // Not comma del? Fuck it man, I dunno
                                        console.warn("Bug: " + "Sequence problem: link <b>" + targDest + "</b> not found on page");
                                        THIS.next();
                                    }
                                }
                            }
                        } else if (targAction == 'draw') {
                            drawObj(THIS.pageElem.objs[targDest]);
                        } else if (splitTarg.length > 1) {
                            if (splitTarg[0] == 'move') {
                                var objName = targDest;
                                var objSel = THIS.pageElem.objs[targDest];
                                var center = splitTarg[1].split(",");
                                if (!objSel) {
                                    // New format for move to, to acomodate randoms.
                                    // UUUUUUUGLY!!
                                    splitTarg = curTarg[1].split('|');
                                    objName = splitTarg[1];
                                    objSel = THIS.pageElem.objs[objName];
                                    center = targDest.split("X");
                                    if (center.length == 1) {
                                        center = targDest.split(",");
                                    }
                                }
                                if (objSel) {
                                    // Not given in top left, but centerY centerX
                                    objSel.left = center[0] - (objSel.width / 2);
                                    objSel.top = center[1] - (objSel.height / 2);
                                    THIS.pageElem.redraw();
                                    THIS.next();
                                } else {
                                    console.warn("Bug: " + "Sequence problem: Object <b>" + objName + "</b> not found on page");
                                    THIS.next();
                                }
                            } else if (splitTarg[0] == 'flash') {
                                flashObj(targDest, splitTarg);
                            } else if (splitTarg[0] == "play in place") {
                                playGifInPlace(targDest, splitTarg);
                            } else if (splitTarg[0] == "play" || splitTarg[0] == "play blocking" || splitTarg[0] == "play passive") {
                                var objName = targDest.split("|")[0];
                                var objLoc = THIS.pageElem.objs[objName];
                                var animName = targDest.split("|")[1];
                                playGifInPlace(objName, targAction.split("|"));
                                animateObject(objLoc, animName);
                            } else {
                                console.warn("Bug: " + "Sequence problem: unknown split target action - <b>" + splitTarg[0] + "</b>");
                            }
                        } else if (targAction.toLowerCase() == "reassign drop") {
                            var linkName = targDest.split(",")[0];
                            var dropName = targDest.split(",")[1];
                            var key = THIS.pageElem.linkKey[linkName];
                            book[THIS.pageElem.ident - 1].drops[key.pos].requires = dropName;
                            THIS.next();
                        } else {
                            console.warn("Bug: " + "Sequence problem: unknown action - <b>" + targAction + "</b>");
                        }
                    } else if (targType == "audio") {
                        var checkRecord = targAction.split(" ")[0] == "overwrite";
                        if (checkRecord) {
                            record(curTarg);
                        } else {
                            if (spriteKey) {
                                if (!book.sprite.paused) {
                                    THIS.listNum--;
                                    wait('silence');
                                } else {
                                    // play sounds
                                    playSound(targDest);
                                }
                            } else {
                                if (THIS.openAudio) {
                                    THIS.listNum--;
                                    wait('silence');
                                    // debug
                                    // console.warn("Aud dupe: adding silence");
                                } else {
                                    playSound(targDest);
                                }
                            }
                        }
                    } else if (targType == "page") {
                        // goto page
                        gotoPage(targDest);
                    } else if (targType == "url") {
                        var url = targDest;
                        if (targDest.substr(0, 14).toLowerCase() == "base64encoded(") {
                            url = atob(targDest.substr(14, targDest.length - 15));
                        }
                        if (url == "PreviousWebPage") {
                            window.history.go(-1);
                        } else if (url == "HomeWebPage") {
                            window.location.href = "cdvfile://localhost/index.html";
                        } else if (url == "BookShelf") {
                            window.location.href = "cdvfile://localhost/books.html";
                        } else {
                            // same tab, new tab, new window, nothing special
                            if (targAction == "same tab") {
                                same_tab(url, false);
                            } else if (targAction == "new tab") {
                                new_tab(url);
                            } else if (targAction == "new window") {
                                new_window(url);
                            } else {
                                // console.warn("Bug: " + 'unknown type of window <b>"' + targAction + '"</b> defaulting to new window');
                                console.warn('unknown type of window <b>"' + targAction + '"</b> defaulting to new window');
                                new_window(url);
                            }
                        }
                    } else if (targType == "wait") {
                        // all wait events
                        targDest = targDest.toLowerCase();
                        wait(targDest);
                    } else if (targType == "highlighter") {
                        highlight(targDest);
                    } else if (targType == 'redraw') {
                        THIS.pageElem.redraw();
                        THIS.next();
                    } else if (targType == 'dialog') {
                        dialog(targAction.split(' ')[0], targDest);
                    } else if (targType == 'log') {
                        console.log("Log event: " + '"' + targAction + '"');
                        THIS.next();
                    } else if (targType == "logic" || targType == "points") {
                        logic(this.finalLogicTargets[0]);
                        this.finalLogicTargets.shift();
                        THIS.next();
                    } else if (targType == "countdown") {
                        this.countdown(targAction, targDest);
                        this.next();
                    } else if (targType.toLowerCase() == "drawing tool") {
                        targDest = targDest.toLowerCase();
                        if (targDest == "eraser") {
                            book.drawingTools.cur = "eraser";
                        } else {
                            var spt = targDest.split(",");
                            var tool = spt.shift();
                            if (tool == "pencil" || tool == "chalk") {
                                var color = spt.splice(0, 4);
                                color[3] /= 100;
                                var width = spt[0];
                                book.drawingTools.cur = tool;
                                book.drawingTools.curColor = color;
                                book.drawingTools.width = (width) ? width : 5;
                            } else {
                                console.warn("Bug: " + "Sequence problem: Unknown drawing tool - <b>" + tool + "</b>");
                            }
                        }
                        THIS.next();
                    } else if (targType == "generate") {
                        var spt = targDest.split(" ");
                        var genType = spt[0];
                        if (genType == "Math") {
                            var d1 = spt[1].substring(0, spt[1].length - 1);
                            var o = spt[2];
                            if (spt[2].length > 1) {
                                var rnd = Math.ceil(Math.random() * spt[2].length);
                                o = spt[2][rnd - 1];
                            }
                            var d2 = spt[3].substring(0, spt[3].length - 1);
                            var r1 = (Math.random() * 9) + 1; // 1.00000 - 9.999999
                            var r2 = (Math.random() * 9) + 1; // 1.00000 - 9.999999
                            var n1 = Math.floor(r1 * (Math.pow(10, d1 - 1)));
                            var n2 = Math.floor(r2 * (Math.pow(10, d2 - 1)));

                            THIS.pageElem.objs["Math N1"].contents = "" + n1;
                            THIS.pageElem.objs["Math N2"].contents = "" + n2;
                            THIS.pageElem.objs["Math O1"].contents = "" + o;
                            THIS.pageElem.objs["Math A1"].contents = "0"; // Clear ans every new question. Makes sense right?
                            THIS.pageElem.redraw();
                            THIS.next();
                        } else {
                            console.warn("Bug: " + "Sequence problem: unidentified generate type - <b>" + genType + "</b>");
                        }
                    } else if (targType == "image") {
                        if (targAction.split(" ")[0] == "overwrite") {
                            var type = targAction.split(" ");
                            type.shift();
                            type = type.join(" ");
                            overwriteImage(targDest, type)
                        } else {
                            console.warn("Bug: " + 'unknown action of <b>"' + targAction + '"</b>');
                            THIS.next();

                        }
                    } else {
                        console.warn("Bug: " + "Sequence problem: unidentified target type - <b>" + targType + "</b>");
                        THIS.next();
                    }
                } else {
                    THIS.next();
                }
            } else {
                this.endCheck();
            }
        }
    }

// Make sure action is lower case
    this.countdown = function (action, time) {
        var seconds = time.split(" ")[0];
        if (action == "set to" || action == "start at" || action == "add to" || action == "subtractFrom") {
            if (time.split(" ")[1].toLowerCase() == "seconds") {
                seconds *= 1
            } else if (time.split(" ")[1].toLowerCase() == "minutes") {
                seconds *= 60;
            } else {
                console.warn("Bug: " + "Countdown problem: Unknown time - <b>" + time + "</b>");
            }
        }
        var pNum = THIS.pageElem.ident - 1;

        if (action == "set at") {
            THIS.pageElem.countdown = seconds;
        } else if (action == "start at") {
            THIS.pageElem.countdown = seconds;
            window.clearInterval(THIS.pageElem.countdownInt);
            THIS.pageElem.countdownInt = window.setInterval(countdownInt, 1000);
        } else if (action == "add to") {
            THIS.pageElem.countdown += seconds;
        } else if (action == "subtract from") {
            THIS.pageElem.countdown -= seconds;
            // If subtracting past 0, set to 0
            if (THIS.pageElem.countdown < 0) {
                THIS.pageElem.countdown = 0;
                // If there was an active countdown, trigger the finish event
                if (THIS.pageElem.countdownInt) {
                    countdownInt();
                }
            }
        } else if (action == "stop") {
            window.clearInterval(THIS.pageElem.countdownInt);
            THIS.pageElem.countdownInt = false;
            THIS.pageElem.countdown = 0;
            THIS.pageElem.redraw();
        } else if (action == "pause") {
            window.clearInterval(THIS.pageElem.countdownInt);
            THIS.pageElem.countdownInt = false;
        } else if (action == "finish") {
            THIS.pageElem.countdown = 0;
            countdownInt();
        } else if (action == "resume") {
            window.clearInterval(THIS.pageElem.countdownInt);
            THIS.pageElem.countdownInt = window.setInterval(countdownInt, 1000);
        } else {
            console.warn("Warning: " + "Unknown countdown action - " + action);
        }

        // finish(pNum);

        // start(pNum);
    };

    this.endCheck = function () {
        if (THIS.openAnims || THIS.openFlash || THIS.openHighlight || THIS.openDrawing || THIS.openAudio || THIS.openWait || THIS.openVideo || THIS.openGif || THIS.listNum < THIS.listArr.length) {
            if (showsequence) {
                console.log("Sequence log: " + "endCheck false, something still going on");
            }
        } else {
            if (curSequence) {
                THIS.complete();
            } else {
                // Sequence has been cleared, I am a ghost function wooooo;
            }
        }
    };

    this.complete = function () {
        THIS.end(true);
    };

    this.end = function (completed) {
        if (!THIS.holdClear) {
            if (THIS.running || inSequence) {
                THIS.running = false;
                inSequence = false;
                THIS.pageElem.redraw();
                if (THIS.pageElem.ident == curPage) {
                    if (this.finalLogicTargets.length) {
                        if (showsequence) {
                            console.log("Warning: " + this.finalLogicTargets);
                        }
                        if (!this.logicDone) {
                            // Sequence interruped before logic targets were taken care of, do it now.
                            logic(this.finalLogicTargets, true);
                        } else {
                            // Logic targets already taken care of.
                        }
                    } else if (completed) {
                        saveState(THIS.pageElem.ident - 1);
                    } else {
                        // Wasn't a logical sequence, wasn't a completion, rather an interruption, don't save the state, reload the last good one.
                    }
                } else {
                    // Abort! He turned the page, nothing should be happening anymore.
                }
                THIS.clear();
                if (showsequence) {
                    console.log("Sequence log: " + "sequence " + linkName + " ended and cleared");
                }
            } else {
                if (showsequence) {
                    console.log("Sequence log: " + "Already ended");
                }
            }
            if (this.hadLogicLinks) {
                checkLogicLinks();
            }
            // If interrupted, check actionArr, then load state and refresh.
            if (!completed) {
                // end of sequence redraw
                // THIS.pageElem.redraw();
                // PROBLEM! Pinned links are reset on redraw. So if there was an animation with a pinned link, and the kid clicked the pinned link, the animation is stopped, the link is reset, THEN we check mouse click location and the link isn't there anymore.
                // SOLUTION! Redraw after actionCheck. Global variable. Does what it says, reset to false in actioncheck.
                window.redrawAfterActionCheck = true;
                // Same problem with loadState, same solution
                if (!this.finalLogicTargets.length) {
                    window.loadStateAfterActionCheck = true;
                }
            }
        }
    };

    this.clear = function () {
        if (!THIS.holdClear) {
            if (!book.sprite.paused) {
                book.sprite.pause();
                book.sprite.currentTime = spriteKey['page' + THIS.pageElem.ident].start;
                if (book.sprite.startCheck) {
                    window.clearInterval(book.sprite.startCheck);
                    book.sprite.startCheck = false;
                }
                if (book.sprite.volSet) {
                    window.clearTimeout(book.sprite.volSet);
                    book.sprite.volSet = false;
                }
                if (book.sprite.endCheck) {
                    window.clearTimeout(book.sprite.endCheck);
                    book.sprite.endCheck = false;
                }
            } else if (THIS.openAudio) {
                book.audChannel.pause();
            }
            if (THIS.openAnims) {
                for (var a in THIS.objectsAnimating) {
                    window.clearInterval(THIS.objectsAnimating[a].animInterval);
                    window.clearTimeout(THIS.objectsAnimating[a].animTimeout);
                }
                THIS.openAnims = 0;
                THIS.objectsAnimating = [];
            }
            if (THIS.openWait) {
                window.clearTimeout(THIS.openWait);
                THIS.openWait = false;
            }
            if (THIS.openVideo) {
                if (isFirefox && isMac) {
                    THIS.openVideo.Stop();
                } else {
                    THIS.openVideo.pause();
                }
                THIS.openVideo = false;
                window.clearInterval(THIS.playCheck);
            }
            if (THIS.openFlash) {
                window.clearInterval(THIS.flashInt);
                THIS.openFlash = true;
            }
            if (THIS.openHighlight) {
                THIS.openHighlight.clear = true;
                window.clearTimeout(THIS.openHighlight.nextTimeout);
                THIS.openHighlight.vis = THIS.openHighlight.initVis;
            }
            if (THIS.parentHighlight) {
                THIS.pageElem.objs[THIS.parentHighlight].parentMarker = 0;
                THIS.parentHighlight = false;
            }
            if (THIS.minimumHighlightTimer) {
                THIS.pageElem.highlightedLink = false;
            }
            if (THIS.openDrawing) {
                window.clearTimeout(THIS.openDrawing.timeout);
            }

            book.analytics.add({type: "sf", linkname: THIS.linkName});

            sequenceArr = [];
            curSequence = false;
            book.sprite.name = false;
            book.sprite.loc = false;
        }
    };

    function overwriteImage(objName, overwriteType) {
        var obj = book[curPage - 1].objs[objName];
        if (obj) {
            var cameraCheck = false; // TODO: Write a function to check for an integrated camera.
            if (cameraCheck) {
                // TODO: Handle cameras on mobile browser and app
            } else {
                // Uploads for PC (no camera, file prompt)
                book.uploader.uploadImage(obj);
            }
        } else {
            console.warn("Bug: " + "Cannot find object '" + objName + "' to overwrite");
        }
    }

    function logic(curTargs, multi) {
        if (!multi) {
            curTargs = [curTargs];
        }
        for (var t = 0; t < curTargs.length; t++) {
            var curTarg = curTargs[t];
            var action = curTarg[1];
            var destination = curTarg[2].toLowerCase();

            var destIsPoints = false;
            for (var pointName in THIS.pageElem.points) {
                if (destination == pointName)
                    destIsPoints = true;
            }

            if (destIsPoints) {
                var mod = action.charAt(0);
                var num = Number(action.substr(1, action.length));
				if (isNaN(num)) {
					num = Number(action.substr(1, action.split(" ")[0].length));
				}
                book[curPage - 1].points[destination].changed = true;
                if (mod == "+") {
                    book[curPage - 1].points[destination].value += num;
                } else if (mod == "-") {
                    book[curPage - 1].points[destination].value -= num;
                } else if (mod == "=") {
                    book[curPage - 1].points[destination].value = num;
                } else if (typeof Math.round(mod) == "number") {
                    // It's a set!
                    book[curPage - 1].points[destination].value = num;
                } else {
                    book[curPage - 1].points[destination].changed = false;
                    console.warn("Bug: " + "Sequence problem: Unknown action of <b>" + action + "</b>");
                }
                if (book[curPage - 1].points[destination].value < 0 && !book[curPage - 1].allowNegativePoints) {
                    book[curPage - 1].points[destination].value = 0;
                }
            } else {
                console.warn("Bug: " + "Sequence problem: Unknown destination of <b>" + destination + "</b>");
            }
        }
        THIS.logicDone = true;
        THIS.pageElem.redraw();
    }

    function drawObj(obj) {
        THIS.openDrawing = obj;
        obj.draw();
    }

    function playGifInPlace(gifName, playDesc) {
        var gif = THIS.pageElem.objs[gifName];
        var framesPerSecond = playDesc[1];
        gif.speed = framesPerSecond || 24;
        var loopCount = playDesc[2];
        if (loopCount == "" || !loopCount) {
            gif.loopInfinite = true;
        }
        var alternateLoop = playDesc[3];
        // TODO: Alternate loop;
        gif.curLoop = 1;
        gif.targLoop = loopCount;

        if (gif) {
            if (gif.isPlaying) {
                stopLoop(gif, false);
            }
            startLoop(gif);
            // gif.startLoop();
        } else {
            console.warn("Bug: " + "Sequence problem: Can't play gif <b>" + gifName + "</b>. Object not found");
        }
        THIS.next();
    }

    function startLoop(gif) {
        gif.isPlaying = true;
        gif.currentFrame = 0;
        THIS.openGif = true;
        gif.vis = "show"; // default show gifs when playing, why would you not?
        gif.loopInterval = window.setInterval(function () {
            gif.currentFrame++;
            if (gif.currentFrame > gif.length - 1 && gif.isPlaying) {
                if (gif.loopInfinite && !gif.isLastLoop) {
                    gif.currentFrame = 0;
                } else {
                    if (gif.curLoop < gif.targLoop) {
                        gif.currentFrame = 0;
                        gif.curLoop++;
                    } else {
                        // Stop the gif at the last frame, not the first.
                        gif.currentFrame--;
                        book[gif.pageInBook].redraw();
                        window.clearInterval(gif.loopInterval);
                        stopLoop(gif);
                    }
                }
            }
            book[gif.pageInBook].redraw();
        }, 1000 / gif.speed);
    }

    function stopLoop(gif, waitForFinish) {
        gif.isPlaying = false;
        THIS.openGif = false;
        // Reset gif to 0 frame, consistancy with desktop app
        gif.currentFrame = 0;
        THIS.pageElem.redraw();
        if (waitForFinish) {
            gif.isLastLoop = true;
        } else {
            window.clearInterval(gif.loopInterval);
            gif.isLastLoop = false;
            THIS.endCheck();
        }
    }

    function animateObject(sentObj, animName, animType) {
        var animObj = sentObj;
        sentObj.vis = "show";
        var animInfo = sentObj.anim;
        var animAct = animInfo[animName];
        if (animObj.anim.AT) {
            // If a previous animation is playing, clear and start again.
            window.clearInterval(animObj.animInterval);
            window.clearTimeout(animObj.animTimeout);
        } else {
            THIS.openAnims++;
        }
        animInfo.AT = 1;
        animInfo.active = animName;
        THIS.pageElem.change = true;
        var animEnd = function () {
            window.clearInterval(animObj.animInterval);
            window.clearTimeout(animObj.animTimeout);
            animInfo.AT = animAct.data.length - 1;
            THIS.pageElem.redraw();
            var lastVals = animInfo[animInfo.active].data[animInfo.AT];
            animObj.top = lastVals.top;
            animObj.left = lastVals.left;
            if (animObj.leftOffset !== false && animObj.topOffset !== false) {
                animObj.left -= animObj.leftOffset;
                animObj.top -= animObj.topOffset;
            }
            animObj.width = lastVals.width;
            animObj.height = lastVals.height;
            if (animObj.swapWidth) {
                animObj.swapWidth = lastVals.width;
                animObj.swapHeight = lastVals.height;
                animObj.newWidth = lastVals.width;
                animObj.newHeight = lastVals.height;
            }
            animObj.rot = lastVals.rot;
            animObj.opacity = lastVals.opacity;
            animInfo.AT = false;
            animInfo.active = false;
            THIS.openAnims--;
            if (animType == "play passive") {
                THIS.endCheck();
            } else {
                THIS.next();
            }
        };
        if (animAct) {
            animObj.animInterval = window.setInterval(function () {
                if (animInfo.AT >= animAct.data.length - 1) {
                    animEnd();
                    if (!animObj.initLoopInfinite) {
                        stopLoop(animObj, true);
                    }
                } else {
                    animInfo.AT++;
                    THIS.pageElem.redraw();
                }
            }, 40);
            animObj.animTimeout = window.setTimeout(function () {
                animEnd();
            }, animAct.data.length * 40);
            THIS.objectsAnimating.push(animObj);
        } else {
            console.error("Error: " + "Sequence problem: Animation '" + animName + "' was not able to play on object.");
            console.error(animInfo);
        }
        if (animType == "play passive") {
            THIS.next();
        }
    }

    function dialog(action, dialogName) {
        if (action == 'display') {
            var locInKey = book[THIS.pageElem.ident - 1].dialogKey['D 1'];
            book[THIS.pageElem.ident - 1].dialogs[locInKey].open();
        } else {
            console.warn("Bug: " + 'Sequence problem: Unknown dialog action <b>' + action + '</b>');
        }
        THIS.next();
    }

    function highlight(objName) {
        var obj = THIS.pageElem.objs[objName];
        obj.currentChild = 1;
        obj.parentMarker = 0;
        if (obj.name == obj.parentHighlighter) {
            if (obj.audio) {
                var name = obj.audio;
                var stripExtension = name.substring(0, name.length - 4);
                playSound(stripExtension, obj);
            } else {
                obj.start();
                if (obj.sequenceBlocking) {
                } else {
                    THIS.next();
                }
            }
        } else {
            console.warn("Bug: " + 'Sequence problem: Highlighter triggered is not a parent highlighter, but a child. Even skipped');
            THIS.next();
        }

    }

    function flashObj(objName, flashDesc) {
        var objName = objName;
        var flashNum = parseInt(flashDesc[1]);
        var flashSpeed = parseFloat(flashDesc[2]);
        var flashWait = flashDesc[3];
        if (flashWait == 'false') {
            flashWait = false;
        } else {
            flashWait = true;
        }

        var objExists = THIS.pageElem.objs[objName];
        if (objExists) {

            /*
             How ray is handling flashes
             Flash 3 times means
             OFF, ON, OFF, ON, OFF, ON
             Flash 3 times with curvis of hide means
             ON, OFF, ON, OFF, ON
             An interval is how much time it takes for 2 state changes, so flash 3 times at int of 2s takes 6s, not 12s.

             That about sums it up.
             */
            flashNum *= 2;
            if (objExists.vis == "hide") {
                flashNum--;
                ;
            }
            flashSpeed /= 2;

            var flashVisCur = THIS.pageElem.objs[objName].vis;
            THIS.openFlash = true;
            THIS.flashInt = window.setInterval(function () {
                if (flashNum <= 0) {
                    window.clearInterval(THIS.flashInt);
                    THIS.openFlash = false;
                    if (flashWait) {
                        THIS.next();
                    } else {
                        THIS.endCheck();
                    }
                } else {
                    flashNum--;
                    if (flashVisCur == 'show') {
                        flashVisCur = 'hide'
                    } else {
                        flashVisCur = 'show'
                    }
                    showHide(objName, flashVisCur, false);
                }
            }, flashSpeed * 1000);
            if (!flashWait) {
                THIS.next();
            }
        } else {
            THIS.next();
        }
    }

    function resetObject(obj) {
        if (obj == "Page") {
            THIS.pageElem.reload();
            THIS.next();
        } else if (THIS.pageElem.objs[obj]) {
            var curObj = THIS.pageElem.objs[obj];
            curObj.left = curObj.initLeft;
            curObj.top = curObj.initTop;
            curObj.height = curObj.initHeight;
            curObj.width = curObj.initWidth;
            curObj.vis = curObj.initVis;
            if (curObj.type == "drawing") {
                curObj.drawn = (curObj.vis == "show") ? true : false;
            }
            if (THIS.pageElem.activeClones > 0) {
                for (var i = 1; i <= THIS.pageElem.activeClones; i++) {
                    var curClone = THIS.pageElem.objs[obj + "_clone_" + i];
                    if (curClone) {
                        delete curClone;
                        var cloneInKey = false;
                        for (var ii = 0; ii < THIS.pageElem.objKey.length; ii++) {
                            if (THIS.pageElem.objKey[ii] == obj + "_clone_" + i) {
                                cloneInKey = ii;
                            }
                        }
                        if (cloneInKey) {
                            THIS.pageElem.objKey.splice(cloneInKey, 1);
                        }
                    }
                }
                THIS.pageElem.activeClones = 0;
            }
            THIS.pageElem.redraw();
            THIS.next();
        }
    }

    function playVideo(objLoc) {
        if (THIS.openVideo) {
            if (isFirefox && isMac) {
                THIS.openVideo.Stop();
            } else {
                THIS.openVideo.pause();
            }
            window.clearInterval(playCheck);
        }
        if (objLoc.vis == 'hidden') {
            objLoc.vis = 'visible';
            objLoc.elem.style.visibility = objLoc.vis;
        }
        THIS.openVideo = objLoc.elem;

        var exit = false;

        if (isPad) {
            THIS.openVideo.controls = true;
            if (isAndroid) {
                $("#" + THIS.openVideo.id).css({"top": 0, "left": 0, "height": "100%", "width": "100%"});
                THIS.pageElem.CAN.width = THIS.pageElem.CAN.width;
                if (isFirefox && isMac) {
                    THIS.openVideo.SetTime(0);
                    THIS.openVideo.Play();
                } else {
                    THIS.openVideo.currentTime = 0;
                    THIS.openVideo.play();
                }
            }
        } else {
            if (isFirefox && isMac) {
                THIS.openVideo.SetTime(0);
                THIS.openVideo.Play();
            } else {
                THIS.openVideo.currentTime = 0;
                THIS.openVideo.play();
            }
        }

        if (isFirefox && isMac) {
            // THIS.next();
        } else {
            var playFunc = function () {
                // global disable video controls
                objLoc.elem.controls = false;

                // show but only after started
                $(objLoc.elem).css({"display": ""});
                objLoc.elem.removeEventListener('playing', playFunc);
                // THIS.next();
            };
            objLoc.elem.addEventListener('playing', playFunc, false);
        }
        var endFunc = function () {
            objLoc.elem.removeEventListener('ended', endFunc);
            window.clearInterval(THIS.videoRefresh);
            if (isFirefox && isMac) {
                // changed
                // THIS.openVideo.SetTime(0)
                THIS.openVideo.pause();
            } else {
                // changed
                // THIS.openVideo.currentTime = 0;
                THIS.openVideo.pause();
            }
            THIS.pageElem.redraw();
            THIS.openVideo = false;
            if (THIS.openWait == true) {
                window.clearTimeout(THIS.openWait);
                THIS.openWait = false;
            }

            THIS.next();
        };
        objLoc.elem.addEventListener('ended', endFunc, false);
    }

    function playSound(soundElem, highlightObj) {
        logSecStamp("playSound() called");
        if (soundElem == book.sprite.name) {
            if (highlightObj) {
                highlightObj.start();
            } else {
                THIS.next();
            }
        } else {
            if (spriteKey) {
                window.clearInterval(book.sprite.endCheck);
                window.clearInterval(book.sprite.startCheck);
                //var soundElem = soundElem.replace(/ /g, '');
                var locInKey = spriteKey['page' + THIS.pageElem.ident];
                if (locInKey && locInKey[soundElem] && !THIS.pageElem.recordings[soundElem]) {
                    THIS.openAudio = true;
                    book.sprite.name = soundElem;
                    book.sprite.loc = locInKey;
                    book.sprite.audStart = parseFloat(locInKey[soundElem].start);
                    book.sprite.audStart -= 0.15;
                    book.sprite.currentTime = book.sprite.audStart;
                    book.sprite.audEnd = locInKey[soundElem].end;
                    //var revertVol = book.sprite.volume;
                    book.sprite.volume = 0;
                    var startTime = book.sprite.currentTime;

                    book.sprite.play();
                    book.sprite.volSet = window.setTimeout(function () {
                        //book.sprite.volume = revertVol;
                    }, 1);
                    /*
                     console.clear();
                     console.info('start ' + startTime);
                     console.info('cur ' + book.sprite.currentTime);
                     console.info(book.sprite.currentTime-startTime);
                     */
                    book.sprite.volume = 1;
                    if (window.testing) {
                        book.sprite.volume = 0.1;
                    }

                    book.sprite.startCheck = window.setInterval(function () {
                        if (book.sprite.currentTime > book.sprite.audStart) {
                            window.clearInterval(book.sprite.startCheck);
                            if (highlightObj) {
                                highlightObj.start();
                                if (highlightObj.sequenceBlocking) {
                                    // wait for highlighter to finish before continuing sequence
                                } else {
                                    THIS.next();
                                }
                            } else {
                                THIS.next();
                            }
                        }
                    }, 50);
                    book.sprite.endCheck = window.setInterval(function () {
                        if (book.sprite.currentTime > book.sprite.audEnd + 0.500) {
                            book.sprite.pause();
                            THIS.openAudio = false;
                            window.clearInterval(book.sprite.endCheck);
                            book.sprite.endCheck = false;
                            book.sprite.name = false;
                            book.sprite.loc = false;
                            if (THIS.parentHighlight && THIS.pageElem.objs[THIS.parentHighlight].waitForAudio) {
                                THIS.pageElem.objs[THIS.parentHighlight].parentMarker = 0;
                                THIS.parentHighlight = false;
                                //THIS.pageElem.redraw();
                            }
                            if (book.sprite.waitingForSilence) {
                                //book.sprite.currentTime = locInKey.start;
                                book.sprite.waitingForSilence = false;
                                window.setTimeout(function () {
                                    THIS.next();
                                }, 1);
                            } else if (THIS.listNum >= THIS.listArr.length) {
                                window.setTimeout(function () {
                                    THIS.endCheck();
                                }, 1);
                            }
                            /* Why the timeouts around the ends and nexts?
                             Because the pause needs a minute to actually do it's thing.
                             If you don't give it a tick, the next instance of play
                             (if that's the first item of the next sequence)
                             will throw a fit.
                             "I wasn't ready, you just told me to pause, make up your mind, I need to change first".
                             Freaking... girlfriend of a media element. Jeeze.
                             */
                        }
                    }, 200);
                } else {
                    console.warn("Bug: " + "Sequence problem: Cannot find sound <b>" + soundElem + "</b>");
                    if (highlightObj) {
                        highlightObj.start();
                    } else {
                        THIS.next();
                    }
                }
            } else {
                var curElem = THIS.pageElem.auds[soundElem];
                if (typeof curElem == "undefined") {
                    console.warn("Bug: " + "Sequence problem: Can't find sound element <b>" + soundElem + "</b>");
                    THIS.next();
                } else {
                    THIS.openAudio = true;
                    var src;
                    if (THIS.pageElem.recordings[soundElem]) {
                        if (isCordova) {
                            src = THIS.pageElem.recordings[soundElem];
                            src += noCacheExt();
                        } else {
                            src = THIS.pageElem.recordings[soundElem].elem.getAttribute("src");
                        }
                    } else {
                        var wetSrc = (THIS.pageElem.auds[soundElem].elem) ? THIS.pageElem.auds[soundElem].elem.getAttribute("src") : false;
                        var drySrc = THIS.pageElem.auds[soundElem].drySrc;
                        var backupSrc = "audio/" + soundElem + ".ogg";
                        if (wetSrc) {
                            src = wetSrc;
                        } else if (drySrc) {
                            src = drySrc;
                        } else {
                            src = backupSrc;
                        }
                        console.log("playing " + src);
                    }
                    var now = Date.now();
                    if (THIS.openAudio) {
                        book.audChannel.pause();
                        book.audChannel.currentTime = 0;
                        function audEnd() {
                            book.audChannel.removeEventListener('ended', audEnd);
                            // timeout here?
                            THIS.openAudio = false;
                            if (THIS.openWait) {
                                // debug
                                // console.warn("Aud end: next in seq. PID: " + book.audChannel.pid);
                                window.clearTimeout(THIS.openWait);
                                THIS.openWait = false;
                                THIS.next();
                            } else {
                                // debug
                                // console.warn("Aud end NO WAIT: end seq. PID: " + book.audChannel.pid);
                                THIS.endCheck();
                            }
                        }
                        function audStarted() {
                            book.audChannel.removeEventListener('playing', audStarted);
                            book.audChannel.addEventListener('ended', audEnd);
                            if (highlightObj) {
                                highlightObj.start();
                            } else {
                                // debug
                                // console.warn("Aud start: next in seq. PID: " + book.audChannel.pid);
                                THIS.next();
                            }
                            logSecStamp("aud actually started playing called"); // AND THIS
                        }

                        // BUG:
                        /*
                         * In some semi-rare cases, the new audio will END before it PLAYs
                         *
                         * Soo... set end event listener inside the start function.
                         *
                         * What if there's a 0 second long audio file?
                         *
                         * Just check submission, there aren't
                         */
                        //
                        book.audChannel.addEventListener('playing', audStarted);
                        book.audChannel.addEventListener('error', function failed(e) {
                            switch (e.target.error.code) {
                                case e.target.error.MEDIA_ERR_ABORTED:
                                    console.error("Error: " + 'You aborted the audio playback.');
                                    break;
                                case e.target.error.MEDIA_ERR_NETWORK:
                                    console.error("Error: " + 'A network error caused the audio download to fail.');
                                    break;
                                case e.target.error.MEDIA_ERR_DECODE:
                                    console.error("Error: " + 'The audio playback was aborted due to a corruption problem or because the audio used features your browser did not support.');
                                    break;
                                case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                    console.error("Error: " + 'The audio audio not be loaded, either because the server or network failed or because the format is not supported.');
                                    console.error(book.audChannel.src);
                                    break;
                                default:
                                    console.error("Error: " + 'An unknown error occurred.');
                                    break;
                            }
                            THIS.openAudio = false;
                            THIS.next();
                        }, true);

                        // Maybe the delay is in replaying the same audio over itself... Maybe that fucks up event listneres
                        if (src !== $(book.audChannel).attr("src")) {
                            book.audChannel.src = src;
                        }
                        // book.audChannel.pid = parseInt(Math.random() * 10000);
                        book.audChannel.play();
                    } else {
                        THIS.next();
                    }
                }
            }
        }
    }

    this.staticCheck = function () {
        if (THIS.openFlash || THIS.openAnims || THIS.openVideo || THIS.openDrawing || THIS.openGif) {
            return true; // something still going on
        } else {
            return false; // Nothing going on (visually)
        }
    };

    function wait(timeTarg) {
        if (timeTarg == "silence") {
            // Add event listener if audio is playing, next in list if no audio is playing
            if (spriteKey) {
                if (book.sprite.endCheck || THIS.openVideo) {
                    book.sprite.waitingForSilence = true;
                    // THIS.openWait = true;
                } else {
                    if (!THIS.openWait) {
                        THIS.next();
                    }
                }
            } else {
                if (THIS.openAudio) {
                    THIS.openWait = true;
                } else {
                    THIS.next();
                }
            }
        } else if (timeTarg == "static") {
            THIS.openWait = window.setInterval(function () {
                if (!THIS.staticCheck()) {
                    window.clearTimeout(THIS.openWait);
                    THIS.openWait = false;
                    THIS.next();
                }
            }, 100);
        } else {
            THIS.openWait = window.setTimeout(function () {
                window.clearTimeout(THIS.openWait);
                THIS.openWait = false;
                THIS.next();
            }, parseFloat(timeTarg) * 1000);
        }
    }

    function showHide(objName, setTo, gotoNext) {
        THIS.pageElem.change = true;
        if (objName.toLowerCase() == "all images") {
            for (var o in THIS.pageElem.objs) {
                var obj = THIS.pageElem.objs[o];
                if (typeof obj != "undefined" && obj.name != THIS.pageElem.leftBackgroundImage && obj.name != THIS.pageElem.rightBackgroundImage) {
                    THIS.pageElem.objs[o].vis = setTo;
                    if (THIS.pageElem.objs[o].type == "drawing") {
                        THIS.pageElem.objs[o].drawn = (THIS.pageElem.objs[o].vis == "show") ? true : false;
                    }
                }
            }
        } else {
            if (THIS.pageElem.objs[objName]) {
                THIS.pageElem.objs[objName].vis = setTo;
                if (THIS.pageElem.objs[objName].type == "drawing") {
                    THIS.pageElem.objs[objName].drawn = (THIS.pageElem.objs[objName].vis == "show") ? true : false;
                }
                // Video element reset in redraw function
                THIS.pageElem.redraw();

            } else {
                // Checking if group.
                var objs = objName.split(",");
                if (objs.length > 1) {
                    for (var i = 0; i < objs.length; i++) {
                        var obj = objs[i];
                        showHide(obj, setTo, false);
                    }
                } else {
                    console.warn("Bug: " + "Sequence problem: Image <b>" + objName + "</b> does not exist, skipping showhide");
                }
            }
        }
        if (gotoNext) {
            THIS.next();
        }
    }

    function gotoPage(pageTarg) {
        // Original page, pre change.
        var which = curPage - 1;
        if (pageTarg >= 0 && !isNaN(pageTarg)) {
            if (pageTarg > bookLength) {
                reset = false;
                return false;
            } else if (pageTarg <= 0) {
                return false;
            } else {
                gotoChange(false, pageTarg);
            }
        } else {
            if (pageTarg.toLowerCase() == 'next') {
                if (curPage < bookLength) {
                    gotoChange(false, curPage + 1);
                } else {
                    gotoChange(false, 1);
                }
                THIS.end();
            } else if (pageTarg.toLowerCase() == 'previous') {
                if (curPage > 1) {
                    gotoChange(false, curPage - 1);
                } else {
                    if (!singlePage && isEven(bookLength)) {
                        gotoChange(false, bookLength + 1);
                    } else {
                        gotoChange(false, bookLength);
                    }
                }
                THIS.end();
            } else {
                console.warn("Bug: " + "Sequence problem: Unknown page targ of <b>" + pageTarg + "</b>");
                return false;
            }
        }
        // which was set before the change in page, so it's good. Any errors return false, so if we're here, everything's good.
        if (book[which].resetWhenLeaving) {
            book[which].reload();
        }
    }

    function same_tab(url, blocked) {
        if (blocked) {
            if (confirm("Author designed pop-up has been blocked! Either click CANCEL and go to " + url + " manually, or click OK to navigate off this page. CAREFUL! You might loose your place!")) {
                window.location = url;
            }
        } else {
            window.location = url;
        }
    }

    function new_tab(url) {
        var win = window.open(url, '_blank');
        if (win == undefined) {
            new_window(url);
        } else {
            win.focus();
        }
    }

    function new_window(url) {
        newwindow = window.open(url, 'name', 'height=page.x,width=page.y');
        if (newwindow == undefined) {
            same_tab(url, true);
        } else {
            if (window.focus) {
                newwindow.focus()
            }
            return false;
        }
    }

    function record(targ) {
        var spt = targ[1].split(" ");
        var max = spt[1] * 1000;
        THIS.recordingName = targ[2];
        var recordingName = THIS.recordingName + "";
        startRecording(recordingName);
        THIS.maxRecordTime = window.setTimeout(function () {
            if (THIS.recordingName == recordingName) {
                stopRecording();
                // THIS.next inside stopRecording function.
            }
        }, max);
    }

    this.start = function sequenceStart() {
        logSecStamp("sequence.start called");
        if (this.triggerType == "drop") {
            if (showsequence) {
                console.log("Sequence log: " + "State NOT saved, trigger type won't allow it");
            }
        } else {
            window.saveState(this.pageElem.ident - 1);
        }
        book.analytics.add({type: "ss", linkname: THIS.linkName});
        if (this.addRecorder && !window.recorderReady) {
            this.holdClear = true; // click to "allow recording" interrupts sequence
            initRecorder(function () {
                THIS.holdClear = false;
                THIS.next();
            });
        } else {
            this.next();
        }
    }
}



function countdownInt() {
    var num = window.curPage - 1;
    book[num].countdown--;
    book[num].redraw();
    if (book[num].countdown <= 0) {
        // finish
        window.clearInterval(book[num].countdownInt);
        book[num].countdown = 0;
        window.clearInterval(book[num].countdownInt);
        book[num].countdownInt = false;
        book[num].redraw();
        if (book[num].countdowns[0]) {
            var link = book[num].countdowns[0];
            if (book.curSequence) {
                book.curSequence.end();
            }
            book.curSequence = new sequence(link.targets, book[num], false, [0, 0], "countdownFinish");
            book.curSequence.start();
        }
    }
}