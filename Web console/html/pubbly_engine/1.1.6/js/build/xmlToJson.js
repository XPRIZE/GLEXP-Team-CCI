function updateJsonFromXML(progressGraph, xmlLoc, cb) {
    // cb function with prepped and pretty XML obj. Attempt to load MainXML.xml first, backup is MainXML.js, then throw.
    $.get(xmlLoc + "?" + rand(0, 100000)).success(function (xmlDoc) {
        progressGraph.say(xmlLoc + ".xml loaded...");
        let xml = {};
        xml.info = {};
        xml.pages = [];

        // Drawing tool defined in pubbly.data
        // BECAUSE after save/load books in current state, want to know which tool is selected. If drawingTools in pubbly.js, not saved.
        xml.drawingTool = {};

        let projectDoc = xmlDoc.getElementsByTagName("Project")[0];
        let infoDoc = projectDoc.getElementsByTagName("Info")[0];
        let generalSet = [
            ["points", "PointNames", [], pointNamesFormatter],
        ];
        // setName, nodeName, backupVal, mod
        let infoSet = [
            ["name", "PrjNameLong"],
            ["height", "SinglePageHeight", false, forceType("int")],
            ["width", "SinglePageWidth", false, forceType("int")],
            ["display", "PageDisplay", "single"],
            ["bullet", "BulletColor", "#OEFEOE"],
            ["interrupt", "TimeToInterrupt", 0, ticksToMili],
            ["saveStates", "ReturnPageToPreviousStateOnInterruptions", 0, forceType("bool")],
            ["navigation", "DisallowPageNavigation", false, booleanFlip],
            ["snapDrops", "SnapDroppedImagesIntoLocation", true, forceType("bool")],
            ["lastPageSpread", "LastPageSingleOrDouble", false, function (isDouble) {
                    if (typeof isDouble !== "string") {
                        // Predates explicitly spelling this out in XML...
                        // I need to make an educated guess afterwards.
                        // Search for "LastPageDoubleEducatedGuess";
                        return undefined;
                    } else {
                        return forceType("bool")(isDouble.toLowerCase() === "double");
                    }
                }],
            ["assetLocationPrefix", "associateName", window.xmlFileName, function (name) {
                    if (name !== "MainXML") {
                        return decodeURI(name) + "_";
                    } else {
                        return "";
                    }
                }],
            ["HighlightLinkColor", "linkHighlightColor", "128,255,255"],
            ["HighlightLinkTransparency", "linkHighlightAlpha", "50", forceType("int")],
            ["HighlightLinkTime", false, 500],
        ];

        for (let s = 0; (s <= generalSet.length && generalSet[s]); s++) {
            let setName = generalSet[s][0], nodeName = generalSet[s][1], backupVal = generalSet[s][2], mod = generalSet[s][3];
            // Techincally... getting general and info sets from same XML node... 
            // BUT information is static, and things like points or (future) countdowns are variable. Not information, but properties.
            xml[setName] = quickGet(nodeName, infoDoc, backupVal, mod);
        }
        for (let s = 0; (s <= infoSet.length && infoSet[s]); s++) {
            let setName = infoSet[s][0], nodeName = infoSet[s][1], backupVal = infoSet[s][2], mod = infoSet[s][3];
            xml.info[setName] = quickGet(nodeName, infoDoc, backupVal, mod);
        }
        xml.info.inrettupt = (xml.info.interrupt == 0);
        xml.info.HighlightLinkColorRGBA = "RGBA(" + xml.info.HighlightLinkColor.split(",").concat(xml.info.HighlightLinkTransparency / 100).join(",") + ")";

        // TODO: Tell ray to fix this, it's stupid
        if (xml.info.display == "single") {
            xml.info.width *= 2;
        }

        let pageSet = [["points", "PointNames", [], pointNamesFormatter],
            ["reloadOnLeave", "ResetWhenLeaving", "false", forceType("bool")],
            ["name", "PageName"],
            ["countdown", null, 0], // No XML node for it yet, but maybe one day we'll add a default
        ];

        let objSets = {
            "all": [
                ["type", "ObjType"],
                ["name", "ObjName"],
                ["layer", "ObjLayer", false, forceType("int")],
                ["vis", "ObjInitVis", true, function (vis) {
                        return vis == "show"
                    }],
                ["loc", "ObjInitTopLeft", false, forceType("commaSplitNum")],
                ["width", "ObjInitWidth", false, forceType("int")],
                ["height", "ObjInitHeight", false, forceType("int")],
                ["opacity", false, 1],
                ["mobility", "ObjMobility", "fixed",
                    translate({"draggable": "drag", "clonable": "clone", "static": "fixed"}, "fixed")
                ],
                ["frontDrag", "ObjMoveForwardAfterDragging", false, forceType("bool")],
                ["animations", "ObjAnimations", false, parseObjAnims], // LOC: xmlFormattingFunctions.js
            ],
            "video": [
                ["fileName", "ObjFileName", false, getFileNameFromPath],
                ["ext", "ObjExt"],
                ["type", null, "video"],
            ],
            "gif": [
                ["fileName", "ObjFileName"],
                ["ext", "ObjExt"],
                ["type", null, "gif"], // should force the type
                ["swapMethod", "swapSizeOrLoc", false],
                ["swapHeight", "swapHeight", false, forceType("int")],
                ["swapWidth", "swapWidth", false, forceType("int")],
            ],

            "image": [
                ["fName", "ObjFileName"],
                ["ext", "ObjExt"],
                ["swapMethod", "swapSizeOrLoc", false],
                ["swapHeight", "swapHeight", false, forceType("int")],
                ["swapWidth", "swapWidth", false, forceType("int")],
            ],
            "sequence": [
                ["type", null, "sequence"],
                ["sequence", "ObjIsImageSequence", "false", forceType("bool")],
                ["dName", "ObjImageSequenceFolder", ""],
                ["frameOrder", "ObjImageSequenceOrder", "", forceType("barSplit")],
            ],
            "field": [
                ["align", "TextAlign", "center"],
                // countdown, points, (fixed text or text)
                ["displayType", "FieldDisplay", false, fieldDisplayTypeFormatter],
                // Countdown_1 (unsupported), Points_1, (fixed text or text)
                ["display", "FieldDisplay", false],
                ["font", "TextFont", "Arial", checkFontSupport],
                ["editable", "AllowEditing", false, forceType("bool")],
                ["size", "TextSize", "auto"],
                ["color", "TextColor", "0,0,0", rgb2hex],
                ["contents", "FldContentsEncoded", "", fieldContentsFormatter], // default empty for user text

                        // OHH what do we have here a teachable moment?
                        //
                        // ["calculated", null, {}, null],
                        //
                        // DOESN'T WORK because Javascript is kind of the fuck-you-it's-linked
                        //
                        // Doin it this way means that all field calculated props are linked to the SAME object, linked to this object right here. Isn't that freaking great?????
                        // ISN"T IT?????
            ],
            "workspace": [
                ["bgTexture", "BackgroundTransparency", false, translate({"false": "blackBoardBG.png"}, false)],
                // Workspaces always visible in design, so hard code here
                ["vis", "", true],
                // Height, width, top and left ALL WRONG. Based off rectangle points ONLY
                ["rect", "Points", false, messyPointsToPoly],
                ["clear", "", true]
            ],
        };

        let linkSet = [
            ["name", "Name"],
            ["type", false, "link"],
            ["drawing", "LineDrawing", false],
            // Virtual links shouldn't have points... and an empty array will ptInPoly() == false every time
            ["poly", "Points", false, messyPointsToPoly],
            ["pinned", "PinnedTo", false],
            ["enabled", "InitialStatus", true, function (status) {
                    if (typeof status.toLowerCase !== "undefined"
                            && status.toLowerCase() == "disabled") {
                        return false;
                    } else {
                        return true;
                    }

                }],
            ["clickHighlight", "AutoHighlightLink", false, forceType("bool")],
            ["clickHighlightOn", false, false],
        ];

        let knownTriggerTypes = ["click"];

        let pageNodes = xmlDoc.getElementsByTagName("Pages")[0].getElementsByTagName("Page");
        if (xml.info.display === "composite" && pageNodes.length <= 2) {
            console.error("Fatal", "XML", "Can't have a cover to cover composite. Must have 3 pages");
            console.error("TODO: Update tools so that all pages have a width node, so you can tell if the 2nd page is actually a spread. At this point, we're just assuming that the last page is always a cover, not a spread width");
        } else {
            for (let p = 0; p < pageNodes.length; p++) {
                let pageNode = pageNodes[p];
                let curPage = {};

                // Sets page info
                for (let ps = 0; (ps < pageSet.length && pageSet[ps]); ps++) {
                    curPage[pageSet[ps][0]] = quickGet(pageSet[ps][1], pageNode, pageSet[ps][2], pageSet[ps][3]);
                }

                curPage.objs = [];
                // Sets all objects
                let objNodes = pageNode.getElementsByTagName("Objects")[0].getElementsByTagName("Object");
                for (let o = 0; o < objNodes.length; o++) {
                    let objNode = objNodes[o];
                    let curObj = {};
                    let type = quickGet("ObjType", objNode);
                    let sequence = quickGet("ObjIsImageSequence", objNode, "false", forceType("bool"));
                    type = (sequence) ? "sequence" : type;
                    let ext = quickGet("ObjExt", objNode, false);
                    if (ext == "gif") {
                        type = "gif";
                    }

                    if (objSets[type]) {
                        // Common props for all objects
                        let curSet = objSets["all"];
                        for (let os = 0; (os < curSet.length && curSet[os]); os++) {
                            curObj[curSet[os][0]] = quickGet(curSet[os][1], objNode, curSet[os][2], curSet[os][3]);
                        }

                        // Specifics (fields, images, ...)
                        curSet = objSets[type];
                        for (let os = 0; (os < curSet.length && curSet[os]); os++) {
                            curObj[curSet[os][0]] = quickGet(curSet[os][1], objNode, curSet[os][2], curSet[os][3]);
                        }

                        if (curObj.mobility == "drag") {
                            curObj.droppedLoc = false;
                        }

                        if (curObj.type == "field") {
                            // Used to store already calculated font sizes
                            curObj.calculated = {};
                        }

                        if (curObj.type == "workspace") {
                            // Workspace top left height and width are all WRONG.
                            // Get that info from the rect
                            let rect = curObj.rect;
                            curObj.loc = [];
                            curObj.loc[0] = Math.min(rect[0][1], rect[1][1], rect[2][1], rect[3][1]);
                            curObj.loc[1] = Math.min(rect[0][0], rect[1][0], rect[2][0], rect[3][0]);
                            let right = Math.max(rect[0][0], rect[1][0], rect[2][0], rect[3][0]);
                            let bottom = Math.max(rect[0][1], rect[1][1], rect[2][1], rect[3][1]);
                            curObj.width = right - curObj.loc[1];
                            curObj.height = bottom - curObj.loc[0];
                        }

                        if (curObj.sequence) {
                            curObj.frames = curObj.frameOrder.map(frame => {
                                let ret = {};
                                ret.dSrc = curObj.dName + "/" + frame;
                                ret.fName = frame;
                                return ret;
                            });
                            curObj.at = 0;
                            // error("update", "New Engine Update Required", "");
                        }

                        // Specifics for swapped assets
                        if (curObj.swapMethod !== false) {
                        }

                        curPage.objs.push(curObj);
                    } else {
                        console.error("log", "XML load", "Unknown object type " + type + ". Skipping");
                    }
                }

                curPage.auds = [];
                curPage.audKey = {};
                curPage.links = [
                ];
                let linkNodes = pageNode.getElementsByTagName("Links")[0].getElementsByTagName("Link");
                for (let l = 0; l < linkNodes.length; l++) {
                    let linkNode = linkNodes[l];
                    let curLink = {
                        triggers: {
                            clicks: [],
                            points: [],
                            // dragStarts:[] <-- Have to check objects
                            dragStops: [],
                            lineStarts: [],
                            lineStops: [],
                            countdowns: [],
                            openPages: []
                        },
                    };
                    for (let ls = 0; (ls < linkSet.length && linkSet[ls]); ls++) {
                        curLink[linkSet[ls][0]] = quickGet(linkSet[ls][1], linkNode, linkSet[ls][2], linkSet[ls][3]);
                    }
                    curLink.layer = (l + 1) * 1;
                    // Composite offsetting
                    // (cover pages have locations with pre offsets... this removes that
                    if (xml.info.display == "composite" && (p == 0 || p == pageNodes.length - 1)) {
                        // Polys are given to me as [left,top].
                        // And the point in poly we snatched expects [x,y] [left,top] format.
                        // so... TODO: Fix this mess

                        // Don't run ptsOffset on links without poly (page links eg). It makes a weird nan array that throws errors while checking in sequence or events or something
                        if (curLink.poly.length) {
                            curLink.poly = ptsOffset(curLink.poly, [xml.info.width / -2, 0]);
                        }
                    }
                    curLink.init = {};
                    curLink.init.poly = curLink.poly.slice();
                    curLink.init.enabled = forceType("bool")(curLink.enabled);
                    curLink.init.drawing = curLink.drawing + "";
                    curLink.init.pinned = forceType("bool")(curLink.pinned);
                    curLink.init.layer = curLink.layer * 1;

                    let triggers = linkNode.getElementsByTagName("Triggers")[0].getElementsByTagName("Trigger");
                    for (let t = 0; t < triggers.length; t++) {
                        /*
                         NOTE: TriggerType can be "click" or "Page Points = 6". This sucks.
                         "click" is a type. "points" is a type.
                         "Page Points = 6" is a conditional. As is "DogPts > 6"
                         
                         messyTriggerToTypeAndConditional() send back a [type,conditional] return
                         And as always, a messy function has a messy name
                         */
                        let messyType = quickGet("TriggerType", triggers[t], "click");
                        let messySplit = messyTriggerToTypeAndConditional(messyType);
                        let type = {
                            "drop": "dragStop",
                            "click": "click",
                            "endline": "lineStop",
                            "countdown": "countdown",
                            "openPage": "openPage",
                            "point": "point",
                        }[messySplit[0]];
                        let condition = messySplit[1];

                        let curSequence = [];
                        if (curLink.triggers[type] !== "undefined") {
                            let curTrigger = {
                                type: type,
                                condition: condition,
                                targets: [],
                                run: 0,
                            }

                            let targets = triggers[t].getElementsByTagName("Target");
                            for (let tg = 0; tg < targets.length; tg++) {
                                let messyTarget = {
                                    type: quickGet("Type", targets[tg]),
                                    action: quickGet("Action", targets[tg], ""),
                                    destination: quickGet("Destination", targets[tg], ""),
                                };
                                // WARN: YUUUGE handler this one.
                                let targetArr = messyTargetToPretty(messyTarget, curPage);

                                // TODO: Sprites
                                for (let t = 0; t < targetArr.length; t++) {
                                    let target = targetArr[t];
                                    curTrigger.targets.push(target);
                                    if (target.type == "audio") {
                                        // HHEERREE
                                        curPage.auds.push({
                                            ext: false,
                                            fSrc: false,
                                            loaded: false,
                                            errored: false,
                                            fName: target.destination,
                                        });
                                        curPage.audKey[target.destination] = curPage.auds.length;
                                    }
                                }
                            }

                            if (type) {
                                curLink.triggers[plurals[type]].push(curTrigger);
                            } else {
                                console.error("this");
                                console.error("fatal", "XML", "Cann't parse trigger type: " + type);
                            }
                        }

                    }
                    let locInArray = curPage.links.push(curLink) - 1;
                }
                xml.pages.push(curPage);
            }
        }

        // At this point we have translated all important information from XML to JSON.
        // But we now have to add additional information which has not been included in the doc
        //   -- SUCH AS --
        // Init values and current values

        // LastPageDoubleEducatedGuess
        if (xml.info.lastPageSpread == "undefined") {
            // Ray dropped this prop at some point in time.
            // Meaning, I need to infer it from the page naming strings...
            // 33-34 is probs double, 33 is def single.
            // If I can't infer, I guess single. Good?
            let name = xml.pages[xml.pages.length - 1].name.split("-");
            if (name.length > 1 && (!isNaN(name[0] * 1) && !isNaN(name[1] * 1))) {
                xml.info.lastPageSpread = true
            } else {
                xml.info.lastPageSpread = false;
            }
        }

        for (let p = 0; p < xml.pages.length; p++) {
            let curPage = xml.pages[p];
            for (let o = 0; o < curPage.objs.length; o++) {
                let curObj = curPage.objs[o];
                // Composite offsetting
                // Ray hands off composite obj locations as if they were a double page width
                if (xml.info.display == "composite"
                        && (p == 0 ||
                                (p == xml.pages.length - 1 && !xml.info.lastPageSpread))) {
                    curObj.loc = ptOffset(curObj.loc, [0, xml.info.width / -2]);
                    for (let anims in curObj.animations) {
                        let anim = curObj.animations[anims];
                        for (let l = 0; l < anim.data.length; l++) {
                            anim.data[l].loc = ptOffset(anim.data[l].loc, [0, xml.info.width / -2]);
                        }
                    }
                }

                curObj.init = {};
                curObj.init.height = curObj.height * 1;
                curObj.init.width = curObj.width * 1;
                curObj.init.loc = [curObj.loc[0] * 1, curObj.loc[1] * 1];
                curObj.init.vis = forceType("bool")(curObj.vis);
                curObj.init.layer = curObj.layer * 1;
                curObj.init.mobility = curObj.mobility + "";
                curObj.init.opacity = curObj.opacity * 1;
                if (curObj.mobility == "drag") {
                    curObj.init.droppedLoc = false;
                }
                if (curObj.clear) {
                    curObj.init.clear = curObj.clear;
                }
                // ALSO!!!! For consistance across the board,
                /*
                 DIRECTORY SOURCE - dSrc
                 folder/file.ext
                 images/thing.jpg
                 
                 FILE SOURCE - fSrc
                 file.ext
                 thing.jpg
                 
                 FILE NAME - fName
                 file
                 thing
                 
                 EXTENSION - ext
                 ext
                 jpg
                 */

                //  name = GreenThing
                //  fName = thing.jpg
                //  src = images/thing.jpg
                if (curObj.fName && curObj.ext) {
                    curObj.fSrc = curObj.fName + "." + curObj.ext;
                }
            }
            curPage.points.changed = [];
            // curPage.init = {};
            // curPage.init.points = jQuery.extend({}, curPage.points);
            curPage.points.init = jQuery.extend({}, curPage.points);
        }

        // LAYER SORT:
        //  - Sometimes we have messed up spaced out layers.
        //   -- INPUT: obj1.layer (3) obj2.layer (26), no more objects
        //  - Sort that out here, keep same order, but only have layer 0-whatever
        //   -- OUTPUT
        for (let p = 0; p < xml.pages.length; p++) {
            let orderedLayers = [];
            for (let o = 0; o < xml.pages[p].objs.length; o++) {
                let obj = xml.pages[p].objs[o];
                orderedLayers.push({locInObjs: o, layer: obj.layer});
            }
            orderedLayers.sort(function (a, b) {
                return a.layer - b.layer;
            });
            for (let ol = 0; ol < orderedLayers.length; ol++) {
                xml.pages[p].objs[orderedLayers[ol].locInObjs].layer = ol;
                xml.pages[p].objs[orderedLayers[ol].locInObjs].init.layer = ol;
            }
        }


        // Now all the inits have been set up. Time to call back with the XML and get the buffer going.

        progressGraph.say("XML parsed. Checking assets");
        cb(xml);
    }).fail(function (err) {
        progressGraph.say("FATAL ERROR: Xml not found. Please double check that a zip file has been uploaded via the admin tools");
        error("fatal", "XML load", window.xmlFileName + ".xml not on server. Cannot display book. Try a reupload.");
    });
}

function quickGet(nodeName, parent, backupVal, mod = null) {
    let ret = (parent) ? parent.getElementsByTagName(nodeName)[0] : false;
    if (typeof ret === "undefined" || ret.innerHTML == "") {
        if (backupVal !== null) {
            val = backupVal;
        } else {
            console.error("fatal", "xml parse", "Missing value for required node '" + nodeName + "'");
        }
    } else {
        val = ret.innerHTML;
    }
    if (val !== null) {
        if (typeof mod === "function") {
            val = mod.call(window, val);
        }
        return val;
}
}



// Messy -- will be more
// Messy with sequences
// Now in xmlFormattingFunctions.js

