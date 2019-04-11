/* FieldContents are sometimes "Points" and sometimes actual text.
 *  Need to change the points from the dot comma mess to a double array
 *  Bunch of other things
 *
 *
 *  All those functions go here.
 */

window.targetID = 0;

function messyTargetToPretty(mess, curPage) {
    // Converst XML targets to pretty JSON ones
    /*
     ALL POSSIBLE TARGETS
     log: DONE

     analytics
     save timestamp
     save points
     save state

     propertyChange
     location
     height
     width
     visibility

     setpoints

     flash: DONE

     countdown
     start
     stop
     set
     pause

     overwrite
     image
     audio

     draw
     line drawing

     animate
     gif
     object

     highlight
     ONE word at a time

     ONE WORD AT A TIME inclusive

     ONE WORD AT A TIME
     INCLUSIVE TO NEXT line

     play
     video
     audio

     navigate
     page
     url

     wait
     time
     silence
     static

     send
     click to link
     drop to link
     */
    /*
     let ret = {
     blocking:"all", // Does not let next thing happen until finished
     hold:false, // Does not happen until last thing finished -> backwards block

     type: what the target is about
     -- point, wait, audio, object, spokenfield

     action: what the target does
     -- set, flash, animate, speak

     destination: what the target acts on
     -- object1, ocean.wav,
     NOTE: Destination can sometimes be an array, if the same attr and val apply to 5/10 similar things

     destinationType: what kind of a destination
     -- object, link, page, audio

     attribute: (optional). Destination's property that target acts on
     -- left, visibility, enabled,

     val: (optional). How the target acts on the destination's attribute.
     -- 50, "hidden", false.

     We have a [type] target. It will [action] the [destination]
     We have a [type] target. It will [action] the [destination] with [value]
     We have a [type] target. It will [action] the [destination]'s [attribute] to [value]
     We have a [type] target. It will [action] the [destination](object)'s [attribute] to [value]


     }
     */

    // Order of this array is the order in which checks will override.
    // IF by chance a messy target meets TWO check criteria, the FIRST takes precedence
    let typeChecks = [
        "log",
        "analytic",
        "propertyChange",
        "point",
        "flash",
        "countdown",
        "overwrite",
        "drawing tool",
        "gif",
        "animation",
        "highlight",
        "spokenfield",
        "play",
        "video",
        "navigate",
        "wait",
        "send",
        "reset",
        "info",
    ];
    let ret = false;
    let additionals = {
        pre: [],
        post: [],
    };

    let lowerType = (mess.type) ? mess.type.toLowerCase() : "";
    let lowerAction = mess.action.toLowerCase();
    let lowerDestination = mess.destination.toLowerCase();


    // Figures out what kinds of target it is
    // Translates to a static pretty target type with extra jason bells and stuff
    for (let c = 0; c < typeChecks.length; c++) {
        let check = typeChecks[c];
        switch (check) {
            case "log":
                if (lowerType === "log") {
                    ret = {
                        blocking: false,
                        hold: false,
                        type: "log",
                        action: "log", // warn, error
                        destination: "console",
                        value: mess.destination
                        // We have a [log].
                        // It will [log] the [console] with ["test"]
                    }
                }
                break;
            case "analytic":
                if (lowerType === "analytic") {
                    // dev idea
                    ret = {
                        blocking: false, // ajax call, don't wait to get something back
                        hold: false,
                        type: "analytic",
                        action: "fs post", // write to file system for later laters
                        destination: "user 5", // or fs or db
                        attribute: "wrong answers",
                        value: "+1", // [link name, full state, points, ...]
                        // We have an [analytic] target.
                        // It will [fs post] the [user 5]'s [wrong answers] to [+1]
                    }
                }

                break;
            case "propertyChange":
                let potentialActions = ["move", "hide", "show", "draggable", "clonable", "static", "disable", "enable"];
                let splitAction = mess.action.split("|");
                if (
                    lowerType === "object"
                    && (
                        potentialActions.includes(mess.action) ||
                        (splitAction[0] && potentialActions.includes(splitAction[0].toLowerCase()))
                    )
                ) {
                    let curAttr = null;
                    let curVal = null;
                    let destType = "object";
                    let curDest;
                    if (mess.destination.split(",").length === 1) {
                        curDest = mess.destination;
                    } else {
                        curDest = mess.destination.split(",");
                    }
                    if (lowerAction == "show" || lowerAction == "hide") {
                        curAttr = "vis";
                        curVal = lowerAction === "show";
                    } else if (lowerAction == "move"
                        || (splitAction[0] && splitAction[0].toLowerCase() == "move")) {
                        curAttr = "center";
                        let messyLoc = mess.destination.toLowerCase().split("x");
                        // NOT a top left, therefore an X,Y
                        curVal = {
                            "x": messyLoc[0] * 1,
                            "y": messyLoc[1] * 1
                        };
                        curDest = splitAction[1];
                    } else if (['draggable', 'clonable', 'static'].indexOf(lowerAction) !== -1) {
                        curAttr = "mobility";
                        curVal = {"draggable": "drag",
                            "clonable": "clone",
                            "static": "fixed"}[lowerAction];
                    } else if (['enable', 'disable'].indexOf(lowerAction) !== -1) {
                        destType = "link";
                        curAttr = "enabled";
                        curVal = (lowerAction == "disable") ? false : true;
                    }

                    if (curAttr !== null && curVal !== null) {
                        ret = {
                            blocking: false,
                            hold: false,
                            type: "propertyChange",
                            action: "set",
                            destination: curDest,
                            destinationType: destType,
                            attribute: curAttr,
                            value: curVal
                        };
                        // We have a [set] target.
                        // It will [set] the [ball]([object])'s [vis] to [show]
                        // It will [set] the [link1,link2,link3]([link])'s [enabled] to [false]
                    } else {
                        console.error("Error: Unknown propertyChange attribute and value");
                    }
                }
                break;
            case "point":
                if (lowerType === "points") {
                    if (reservedWords.points.indexOf(mess.destination) >= 0) {
                        console.error("Error interpreting point target. Cannot name custom points '" + mess.destination + "'. Complete list of reserved point names: " + reservedWords.points.join(",").replace(/,+$/, ""));
                        ret = false;
                    } else {
                        let triggerOnlyOnce = lowerAction.split("once").length > 1;
                        console.log(lowerAction);
                        console.log(triggerOnlyOnce);
                        ret = {
                            blocking: false,
                            hold: false,
                            type: "point",
                            action: lowerAction.charAt(0), // + - * / =
                            destination: lowerDestination, // dogPoints to dogpoints
                            attribute: "value", // for sentence structure only
                            value: parseInt(lowerAction.substring(1)), // 10, 50, 7, 28997

                            // We have a [point] target.
                            // It will [+] the [goals]'s ["value"] with [1]
                        };
                        if (triggerOnlyOnce) {
                            ret.runLimit = 1;
                            ret.run = 0;
                            ret.init = {
                                runLimit: 1,
                                run: 0
                            };
                        }
                    }
                }
                break;
            case "flash":
                let split = mess.action.split("|");
                if (
                    lowerType === "object"
                    && split.length > 1
                    && split[0].toLowerCase() === "flash"
                ) {
                    ret = {
                        blocking: forceType("bool")(split[3]),
                        hold: false,
                        type: "flash", // Start ON, end ON
                        action: "flashon",
                        destination: mess.destination, // What we flashin?
                        num: forceType("int")(split[1]), // Times flashed (will figure out specifics in sequencing
                        stateChangeInterval: split[2] * 500, // Time between ON and OFF

                        // We have a [point] target.
                        // It will [+] the [goals]'s ["value"] with [1]

                    }
                }
                break;
            case "countdown":
                if (lowerType === "countdown") {
                    let timeValue = false;
                    let possibles = [
                        "stop",
                        "pause",
                        "resume",
                        "finish",
                        "start at",
                        "add to",
                        "set at",
                        "subtract from",
                    ];
                    if (possibles.indexOf(lowerAction) !== -1) {
                        let timeless = possibles.slice(0, 4); //"stop", "pause", "resume", "finish"
                        if (timeless.indexOf(lowerAction) == -1) {
                            let time = lowerDestination.split("seconds");
                            if (time.length > 1) {
                                timeValue = time[0].trim();
                            } else {
                                console.error("Unknown countdown time of " + lowerDestination);
                                console.error(mess);
                            }
                        }
                    }
                    let translatedAction = translate({
                        "stop": "kill",
                        "pause": "pause",
                        "resume": "resume",
                        "finish": "finish",
                        "start at": "start_at",
                        "add to": "mod_add",
                        "set at": "mod_set",
                        "subtract from": "mod_subtract",
                    }, false)(lowerAction);

                    ret = {
                        type: "countdown",
                        action: translatedAction,
                        destination: "countdown", // IDEA: Multiple countdowns
                        value: timeValue,
                        // We have a [countdown] target.
                        // It will [add to] the [countdown] with [1]

                    };
                }
                break;
            case "overwrite":
                // TODO: test project
                break;
            case "drawing tool":
                if (lowerType === "drawing tool") {
                    if (lowerAction === "select") {
                        let attrs = lowerDestination.split(",");
                        let tool = attrs.shift();
                        let color = attrs.splice(0, 4);
                        // No opacity sometimes, woo
                        if (!color[3]) {
                            color.push(100);
                        }
                        color = color.map(c => c * 1);
                        let defaultWidths = {"pencil": 5, "chalk": 10, "eraser": 40};
                        let width = attrs[0] * 1 || defaultWidths[tool];

                        // Special hacky case
                        if (color[3] === 1 && width === 1) {
                            ret = {
                                blocking: false,
                                hold: false,
                                type: lowerType,
                                action: lowerAction,
                                destination: "none",
                            };
                        } else {
                            ret = {
                                blocking: false,
                                hold: false,
                                type: lowerType,
                                action: lowerAction,
                                destination: tool,
                                value: color,
                                width: width
                            }
                        }
                    }
                    // We have a [drawing tool] target.
                    // It will [select] the [pencil] with [0,128,0]
                    // With a width of 40
                }
                break;
            case "gif":
                if (lowerType == "object" && lowerAction.split("|")[0] == "play in place") {
                    let desc = lowerAction.split("|");
                    // TODO: Differentiate between gifs and sequences IN HERE.
                    ret = {
                        blocking: false,
                        holds: false,
                        type: "gif",
                        action: "animate",
                        destination: mess.destination,
                        framerate: forceType("int")(desc[1]),
                        loops: forceType("int")(desc[2]),
                        // We have a [type] target.
                        // It will [action] the [destination]
                        // ... [loops] times
                    }
                    // frameRate -- Decided in conversion process
                    // alternate: desc[3], // TODO: or maybe not, don't know if supported
                    // NOTE, desc[3] is "false 15", so I think we're missing a pipe somewhere

                    // All gifs shown before animation
                    let forceShow = {
                        blocking: false,
                        hold: false,
                        type: "propertyChange",
                        action: "object",
                        destination: mess.destination,
                        destinationType: "object",
                        attribute: "vis",
                        value: true,
                        autoDraw: false, // Don't take effect until animation starts
                    };
                    additionals.pre.push(forceShow);
                }
                break;
            case "video":
                if (lowerType === "object" && lowerAction === "play" && mess.destination.split("|").length === 1) {
                    let forceShow = {
                        blocking: false,
                        hold: false,
                        type: "propertyChange",
                        action: "object",
                        destination: mess.destination,
                        destinationType: "object",
                        attribute: "vis",
                        value: true,
                        autoDraw: false, // Don't take effect until animation starts
                    };
                    additionals.pre.push(forceShow);
                    ret = {
                        blocking: true,
                        holds: ["videos"],
                        type: "video",
                        action: "play",
                        destination: mess.destination,
                    }
                }
                break;
            case "animation":
                // More fun shit. Can be,
                /*
                 <Type>Object</Type>
                 <Action>play passive</Action>
                 <Destination>CBM_00_mouse13|Animation_6</Destination>

                 this parses as PASSIVE

                 -- or -- 

                 <Type>Object</Type>
                 <Action>play|passive|| passive</Action>
                 <Destination>CBM_00_mouse13|Animation_6</Destination>

                 this parses as BLOCKING. What?? yeah.

                 -- or --

                 <Type>Object</Type>
                 <Action>play</Action>
                 <Destination>CBM_00_mouse13|Animation_6</Destination>     

                 -- BUT NOT --

                 <Type>Object</Type>
                 <Action>play</Action>
                 <Destination>CBM_00_mouse13</Destination>  

                 Cause that's video
                 */
                // Why? Who knows, just deal with it.
                if (lowerType === "object" && (
                    // Normal single sentence action
                    (lowerAction === "play passive" || lowerAction === "play blocking") ||
                    // Weird piped action
                    (lowerAction.split("|").length >= 2 &&
                        (
                            lowerAction.split("|")[0] === "play" &&
                            (lowerAction.split("|")[1] === "passive" || lowerAction.split("|")[1] === "blocking")
                        )
                    ) ||
                    (lowerAction === "play" && mess.destination.split("|").length >= 2)
                )) {
                    let dest = mess.destination;
                    let animObj = dest.split("|")[0];
                    let animName = dest.split("|")[1];
                    let animBlocking;
                    if (lowerAction.split(" ")[1] == "blocking"
                        // Yeah really, check above.
                        || lowerAction.split("|")[1] == "passive"
                        // Also yes really, > 2016
                        || lowerAction === "play") {
                        animBlocking = ["self"];
                    } else {
                        animBlocking = false;
                    }

                    ret = {
                        blocking: animBlocking,
                        holds: false,
                        type: "animation",
                        action: "animate",
                        destination: animObj,
                        value: animName,
                        // We have a [animation] target.
                        // It will [animate] the [ball] with [bounce]
                    }
                    // All animated objects shown before animation
                    let forceShow = {
                        blocking: false,
                        hold: false,
                        type: "propertyChange",
                        action: "object",
                        destination: animObj,
                        destinationType: "object",
                        attribute: "vis",
                        value: true,
                        autoDraw: false, // Don't take effect until animation starts
                    };
                    additionals.pre.push(forceShow);
                }
                break;
            case "highlight":
                // TODO: test project
                break;
            case "spokenfield":
                if (lowerType === "spokenfield") {
                    let syncType = lowerAction;
                    let syncAudio = (mess.action.split("|").length > 1) ? mess.action.split("|") : mess.action;
                    let syncField = (mess.destination.split("|").length) > 1 ? mess.destination.split("|") : mess.destination;
                    // Test to see if the number of audio files matches the number of sentences in the fields.
                    ret = {
                        blocking: "all",
                        hold: false,
                        type: "spokenfield",
                        action: "block sync", 
                        destination: syncAudio,
                        value: syncField
                    };
                    // We have a spokenfield target. It will block sync the VoiceOver5.mp3 with Field_5
                }
                break;
            case "play":
                if (lowerType == "audio") {
                    ret = {
                        blocking: false,
                        hold: "audios",
                        type: "audio",
                        action: "play",
                        destination: mess.destination,
                        // src: "audio/" + mess.destination + ".mp3",
                        // move src to buffer.js, so auds can find correct extensions preload.
                        // We have a [audio] target.
                        // It will [play] the [bark]
                    }
                }
                break;
            case "navigate":
                if (lowerType == "page" ||
                    lowerType == "url") {
                    // Nothing other than nav links
                    ret = {
                        blocking: "all",
                        hold: "all",
                        type: "navigation",
                        action: "navigate",
                    }
                    if (lowerType == "page") {
                        ret.destination = "pubbly";
                        if (lowerDestination == "previous" ||
                            lowerDestination == "next") {
                            ret.attribute = "relative";
                            ret.value = lowerDestination;
                        } else if (typeof forceType("int")(lowerDestination) == "number") {
                            ret.attribute = "absolute";
                            ret.value = forceType("int")(lowerDestination) - 1;
                        } else if (mess.destination.toLowerCase() == "to be determined") {
                            ret = {
                                blocking: false,
                                hold: false,
                                type: "log",
                                action: "alert", // warn, error
                                destination: "window",
                                value: "URL link undetermined... Please set in Program section of console."
                            };
                        } else {
                            error("warn", "xmlFormatting", "Unknown page navigation link " + lowerDestination);
                        }
                        // We have a [navigate] target. It will [navigate] the [pubbly] [relative] with [previous]
                        // We have a [navigate] target. It will [navigate] the [pubbly] [absolute] with [5]
                    } else if (lowerType == "url") {
                        ret.destination = "browser";
                        // the base64Encoded(shit) is stupid... TODO: just pass encoded
                        let urlEncoded = mess.destination.split("(");
                        urlEncoded = urlEncoded[1].split(")");
                        urlEncoded = urlEncoded[0];
                        let urlDecoded = atob(urlEncoded);
                        ret.attribute = translate({"newwindow": "popup", "newtab": "tab", "sametab": "window"}, "window")(lowerAction);

                        ret.value = urlDecoded;
                        // We have a [navigate] target. It will [navigate] the [browser]'s [window] to [zombo.com]
                    }
                }
                break;
            case "wait":
                if (lowerType == "wait") {
                    let curBlocking = false;
                    let curDest = false;
                    if (isNaN(mess.destination * 1)) {
                        if (mess.destination.toLowerCase() == "static") {
                            curBlocking = ["gifs", "flashes", "animations", "videos", "sequences"];
                            curDest = "static";
                        } else if (mess.destination.toLowerCase() == "silence") {
                            curBlocking = ["audios", "videos"]; // TODO: Change to array of ["audios","highlighter","video"]
                            curDest = "silence";
                        } else {
                            console.error("log", "XML interp", "Unknown wait type of: " + mess.destination);
                        }
                    } else {
                        curBlocking = "waits";
                        curDest = (forceType("int")(mess.destination * 100)) / 100;
                    }

                    ret = {
                        blocking: curBlocking,
                        hold: false,
                        type: "wait",
                        action: "wait for",
                        destination: curDest,
                        // We have a [wait] target.
                        // It will [wait for] the [silence]

                    };
                }
                break;
            case "send":
                // send drop|icon ball to OR send click to
                let actionPhrase = lowerAction.split("|")[0];
                let actionWord = actionPhrase.split(" ")[1]
                if (lowerType == "object" && (
                    actionWord == "click" ||
                    actionWord == "drop"
                    // TODO: line?
                )) {
                    ret = {
                        blocking: false,
                        hold: false,
                        type: "send",
                        action: translate({"drop": "dragStop"}, "click")(actionWord),
                        destination: mess.destination,
                        // We have a [send] target.
                        // It will [click] the [link 1]
                    }
                    if (lowerAction.split("|")[1]) {
                        ret.attribute = lowerAction.split("|")[1].split(" ");
                        ret.attribute.pop();
                        ret.attribute.shift();
                        ret.attribute = ret.attribute.join(" ");
                    }
                }
                break;
            case "reset":
                /*
                 We have a [reset] target. It will [object reset] the [beachball]
                 */
                if (lowerAction == "reset") {
                    ret = {
                        blocking: false,
                        hold: false,
                        type: "reset",
                    }
                    // No way to tell if it's a link, page, or object...
                    // Have to loop through the curPage (scoped from xmlToJson) to find a match
                    let matching = [];
                    curPage.objs.forEach(function (o) {
                        if (mess.destination == o.name) {
                            matching.push("object");
                        }
                    });
                    curPage.links.forEach(function (l) {
                        if (mess.destination == l.name) {
                            matching.push("link");
                        }
                    });
                    let resetType = (lowerDestination == "page") ? "page" : matching.shift();
                    if (matching[0]) {
                        console.warn("Formatting error: Multiple possible reset targets... Defaulting to type " + resetType + ", ignoring " + matching[0]);
                    }
                    ret.action = resetType + " reset";
                    ret.destination = (resetType == "page" ? "page" : mess.destination);
                }
                break;
            case "info":
                /*
                 We have a [type] target. It will [action] the [destination]
                 We have a pageInfo target. It will set the navigation to false;
                 */
                if (lowerAction == "disable page navigation" ||
                    lowerAction == "enable page navigation") {
                    ret = {
                        blocking: false,
                        hold: false,
                        type: "info",
                        action: "set",
                        destination: "navigation",
                        value: lowerAction == "enable page navigation"
                    }
                }
            default:
                break;
        }
    }

    if (ret) {
        //  Randomality: Only for choice destinations (everything except audio and anim)
        //  -- Should work for any destination in the ?choose(item,item,item)? shit
        if (lowerDestination.substring(0, 7) == "?choose") {
            let removeChoice = (lowerDestination.substring(1, 16) == "chooseandremove") ?
                true :
                false;
            let options = mess.destination.substring((removeChoice) ? 17 : 8);
            options = options.substring(0, options.length - 2);
            if (options.substring(options.length - 1) == ",") {
                options = options.substring(0, options.length - 1);
            }
            options = options.split(",");
            let random = {
                removeChoice: removeChoice,
                options: options,
                init: {
                    removeChoice: forceType("bool")(removeChoice),
                    options: options.slice(),
                }
            }
            // Works for everything except random animation...
            ret.destination = "random";
            ret.random = random;
        }
    } else {
        if (typeof mess.type === "undefined"
            || typeof mess.action === "undefined"
            || typeof mess.destination === "undefined"
            || typeof mess.type === ""
            || typeof mess.action === ""
            || typeof mess.destination === ""
            || typeof mess.type === ""
            || typeof mess.action === ""
            || typeof mess.destination === "") {
            console.log("Blank mess probably, please check");
            console.log(mess);
        } else {
            console.log("Added new target? Start here. (You're freakin welcome)");
            console.log(mess);
            ret = {
                blocking: false,
                hold: false,
                type: "log",
                // what:"Could not interpret target: " + mess.type + " " + mess.action + " " + mess.destination + ". Skipping",
                value: "Could not interpret target in XML.js." + '\n' + JSON.stringify(mess),
            }
        }
    }
    let rets = [];
    for (let a = 0; a < additionals.pre.length; a++) {
        rets.push(additionals.pre[a]);
    }
    rets.push(ret);
    for (let a = 0; a < additionals.post.length; a++) {
        rets.push(additionals.post[a]);
    }

    let prettyRets = [];
    // Assign uid to each target... for easy debug
    for (let r = 0; r < rets.length; r++) {
        rets[r].id = "tid" + targetID;

        // Want to see TID first in JSON, so resort prop order with new obj
        let pretty = {};
        pretty.id = rets[r].id;
        pretty.type = rets[r].type;
        pretty.action = rets[r].action;
        pretty.destination = rets[r].destination;
        for (let prop in rets[r]) {
            if (typeof pretty[prop] == "undefined" && (prop !== "blocking" || prop !== "hold")) {
                pretty[prop] = rets[r][prop];
            }
        }
        pretty.blocking = rets[r].blocking;
        pretty.hold = rets[r].hold;
        prettyRets.push(pretty);


        targetID++;
    }
    return prettyRets;
}

function messyTriggerToTypeAndConditional(mess) {
    // click?
    let lowerMess = mess.toLowerCase();
    if (lowerMess == "click") {
        return ["click", "click"];
    } else if (lowerMess == "open page") {
        return ["openPage", "every"];
    } else if (lowerMess == "open page first time") {
        return ["openPage", "first"];
    } else if (mess.toLowerCase().split(" ")[0] == "countdown") {
        return ["countdown", mess.toLowerCase().split(" ")[1]];
    }

    // Points?
    let possibleSplits = [
        " = ",
        " < ",
        " > ",
        " <= ",
        " >= ",
    ];
    let conditional = false;
    possibleSplits.map(function (posibility) {
        if (mess.split(posibility).length > 1) {
            conditional = posibility;
        }
    });
    if (conditional) {
        let split = mess.split(conditional);
        if (split[0].toLowerCase() === "page points") {
            return ["point", ["page points", conditional.trim(), split[1].trim()]];
        } else {
            // custom points
            return ["point", [split[0].toLowerCase(), conditional.trim(), split[1].trim()]];
        }
    }

    // Drops?
    let dropLineSplit = mess.split(",");
    let curType = dropLineSplit[0].toLowerCase().trim();
    if (curType == "drop" || curType == "endline") {
        let accepts = dropLineSplit[1].trim();
        if (accepts == "Any") {
            accepts = "any";
        }
        return [curType, accepts];
    }

    // TODO: drops and lines
    return [false, false];
}

function booleanFlip(val) {
    return !val;
}
function ticksToMili(ticks) {
    return ticks * 1000 / 60;
}
function messyPointsToPoly(ptStr) {
    /*
     let poly = ptStr.split(".").map(function(pts) {
     return forceType("commaSplitNum")(pts);
     });
     */
    let poly = [];
    if (ptStr && ptStr.split) {
        // OOoOooOOOAOOOoOOoOO ONE LINER
        poly = ptStr.split(".").map(forceType("commaSplitNum"));
    }
    return poly;
}

function pointNamesFormatter(pointNames) {
    // TODO: Get ray to fix this... but currently
    //
    // PointNames node (local or global) has the name and default value space seperated
    // Which is already a bad idea, 
    // But it's made worse by the fact that point names can also have a space!!
    // So you might get something like
    // wrong answer 0
    // or
    // wrong answer 5 0
    //
    // ugh
    // Best bet, split by space, lob off last thing, error if problems

    if (typeof pointNames === "object" && pointNames.length === 0) {
        return {};
    } else {
        let ret = {};
        // Another thing. Older books, pre init values, split by bar.
        // So, lets just see which possible split has more shit in it.
        let pointsComma = pointNames.toString().split(",");
        let pointsBar = pointNames.toString().split("|");
        let pointsSplit = (pointsComma.length > pointsBar.length) ? pointsComma : pointsBar;
        for (let p = 0; p < pointsSplit.length; p++) {
            let pointName = pointsSplit[p].toLowerCase();
            // New feature here
            let defaultValue = 0;
            ret[pointName] = defaultValue;
        }
        return ret;
    }

}

// Not used?
function mod(operation, value) {
    // (*10, 5) -> 50 | (!, true) -> false;
    // For quick flips and subtracts and ticks to minutes and whatever
    var operation = operation.toString();
    var ret;
    // TODO: one liner I know there's one but I can't figure it out and I'm TIRED
    var sign = operation.charAt(0);
    var mod = operation.substr(1);
    switch (sign) {
        case "!":
            ret = !value;
            break;
        case "*":
            ret = value * mod;
            break;
        case "/":
            ret = value / mod;
            break;
        case "-":
            ret = value - mod;
            break;
        case "+":
            ret = value + mod;
            break;
        default:
            ret = value;
            error("log", "mod()", "Unknown operation of " + sign);
            break;
    }
    return ret;
}

// Takes bool, int, commaSplit and commaSplitNum
function forceType(type) {
    // Returns a temporary function to be executed
    let funcRet = function (what) {
        switch (type) {
            case "bool":
                if (what == "true" || what == true || what == 1) {
                    return true;
                } else {
                    return false;
                }
                break;
            case "int":
                if (isNaN(parseInt(what))) {
                    if (what !== false) {
                        error("warn", "forceType", "forceType('int') error. " + what + " is NaN");
                    }
                    return what;
                } else {
                    return parseInt(what);
                }
                break;
            case "commaSplit":
                if (what.split(",").length > 1) {
                    return what.split(",");
                } else {
                    return what;
                }
                break;
            case "barSplit":
                if (what.split("|").length > 1) {
                    return what.split("|");
                } else {
                    return what;
                }
                break;
            case "commaSplitNum":
                if (what.split(",").length > 1) {
                    let tmp = what.split(",");
                    let pt = new Array();
                    pt.push(tmp[0] * 1);
                    pt.push(tmp[1] * 1);
                    return pt;
                } else {
                    return what;
                }
                break;
            case "XSplitNum":
                if (what.toLowerCase().split("x").length > 1) {
                    let tmp = what.toLowerCase().split("x");
                    let pt = new Array();
                    pt.push(tmp[0] * 1);
                    pt.push(tmp[1] * 1);
                    return pt;
                } else {
                    return what;
                }
                break;
            default:
                console.log(type);
                error("log", "forceType", "Unknown type of " + type);
                return what;
                break;
        }
    }
    return funcRet;
}

// translate({"draggable": "drag", "clonable": "clone", "static": "fixed"}, "fixed")
function translate(choices, backup) {
    return function (what) {
        if (choices[what.toLowerCase()]) {
            return choices[what.toLowerCase()];
        } else if (typeof backup !== "undefined") {
            return backup;
        } else {
            return what;
        }
    }
}

// Make sure the font requested is in the list of supported things, and return a default font if not
function checkFontSupport(fontName) {
    let supported = [
        "DidactGothic",
        "Garamond",
        "MyriadPro",
        "NotoSans"
    ];
    if (supported.indexOf(fontName) !== -1) {
        return fontName;
    } else {
        return supported[0]; // default;
    }
}

// Maybe swich to "translate"?
function fieldDisplayTypeFormatter(contents) {
    // For FieldDisplay, we either get...
    //
    // Points_1 (name of the custom point variable
    // Countdown (only one countdown so far)
    // Text or Custom Text (actual contents are in FldContentsEncoded
    let knownDisplays = [
        "countdown",
        "fixed text",
        "editable text",
        "text"
    ]
    if (knownDisplays.indexOf(contents.toLowerCase()) !== -1) {
        return contents.toLowerCase();
    } else {
        return "points";
    }
}
function fieldContentsFormatter(contents) {
    // Running atob on an empty hangs everything
    if (contents == "") {
        return "";
    } else {
        try {
            return atob(contents);
        } catch (e) {
            error("warn", "XML LOAD", "FieldContentsEncoded could not be decoded. Prob bad btoa. Returning empty");
            return "";
        }
    }
}

function rgb2hex(rgb) {
    if (rgb) {
        if (typeof rgb == "string") {
            rgb = rgb.split(",");
        }
        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }

        return "#" + hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
    } else {
        return false;
    }
}

function percentToDecimal(percent) {
    let dec = parseFloat(percent) / 100;
    return (typeof dec == "number") ? dec : 0;
}
function parseObjAnims(partial) {
    let ret = {};
    if (partial !== false) {
        // Jquery can't parse <anim></anim><anim></anim>. Has to have surrounding tag.
        partial = "<ObjAnimations>" + partial + "</ObjAnimations>";
        let anims = $(jQuery.parseXML(partial)).find("ObjAnimation");
        for (let a = 0; a < anims.length; a++) {
            let jsAnim = {};
            let anim = anims[a];
            jsAnim.name = quickGet("AnimationName", anim, null/*, checkReservedWords*/);
            jsAnim.data = [];
            jsAnim.totTime = 0;
            let dataString = quickGet("AnimationData", anim, null);
            let legs = dataString.split(":");
            let prevAngle = false;
            if (legs.length > 1) {
                for (let l = 0; l < legs.length; l++) {
                    let leg = legs[l].split("|");
                    let legTime = leg[5] * 1000;
                    legTime = (isNaN(legTime)) ? 0 : legTime;
                    let jsProps = {
                        loc: forceType("commaSplitNum")(leg[0]),
                        width: percentToDecimal(leg[1]),
                        height: percentToDecimal(leg[2]),
                        opacity: percentToDecimal(leg[3]),
                        time: legTime * 1,
                    }
                    jsProps.angle = prevAngle;
                    prevAngle = (typeof (leg[4] * 1) == "number") ? leg[4] * 1 : 0;
                    jsAnim.totTime += legTime;
                    jsAnim.data.push(jsProps);
                }
                ret[jsAnim.name] = jsAnim;
            } else {
                console.warn("Cannot parse animation, only one leg");
                console.warn(dataString);
            }

        }
    }
    return ret;
}
function parseSequenceFrames(baseSrc, frameOrder) {
    let frames = [];
    for (let f = 0; f < frameOrder.length; f++) {
        frames.push({
            dSrc: baseSrc + "/" + frameOrder[f],
        })
    }
    return frames;
}




