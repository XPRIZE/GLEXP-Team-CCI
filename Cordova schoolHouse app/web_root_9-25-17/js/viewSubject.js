var unitSize = 79;
document.addEventListener("deviceready", function () {
    window.addEventListener("batterystatus", onBatteryStatus, false);

    viewportFix();
    var cover = document.createElement("div");
    cover.setAttribute("id", "cover");
    document.body.appendChild(cover);
    $("#cover").css("display", "none");
    window.barHeight = unitSize + 45;


    login(function (userID, schoolXML) {
        schoolXML = $.parseXML(schoolXML);
        window.schoolXML = schoolXML;
        window.schoolName = schoolXML.getElementsByTagName("school")[0].getElementsByTagName("name")[0].innerHTML;
        window.userID = userID;
        readFile("users.xml", function (usersXML) {
            usersXML = $.parseXML(usersXML);
            window.userXML = usersXML;
            window.curUserObj = new User(schoolXML, usersXML); // Shows level up stuff if applicable.
            parseXml(schoolXML);
        })
    }, function () {
        window.location.href = "login.html";
    });

    function parseXml(xml) {
        var str = new XMLSerializer().serializeToString(xml);
        window.xml = xml;
        window.translations = {};
        var translationsXML = xml.getElementsByTagName("translations")[0];
        translations.tutorial = getValByTag(translationsXML, "tutorial") || "tutorial";
        translations.unlock = getValByTag(translationsXML, "unlock") || "unlock";
        translations.game = getValByTag(translationsXML, "game") || "game";
        translations.level = getValByTag(translationsXML, "level") || "level";


        window.curSubject = decodeURI(window.location.href.split("?")[1]);
        var xmlSubs = xml.getElementsByTagName("subject");
        var subXML = false;

        for (var s = 0; s < xmlSubs.length; s++) {
            if (getValByTag(xmlSubs[s], "name").toLowerCase() == window.curSubject.toLowerCase()) {
                subXML = xmlSubs[s];
            }
        }
        var bgSrc = getValByTag(xml, "schoolBG");
        if (bgSrc) {
            $("<style type='text/css'> .tabletBG{ background-image: url(" + window.schoolLoc + "/icons/" + bgSrc + ");} </style>").appendTo("head");
        }
        if (subXML) {
            window.subjectXML = subXML;
            var subject = {};
            window.subjectName = getValByTag(subXML, "name");
            window.subjectDisplayName = getValByTag(subXML, "displayName");
            window.subjectColor = getValByTag(subXML, "color");
            if (!window.subjectColor) {
                window.subjectColor = "#006EDD";
            }
            addAccentStyle(window.subjectColor);
            subject.name = window.subjectName;
            subject.displayName = window.subjectDisplayName || window.subjectName;
            window.curSubject = subject.name;

            var tutorials = schoolXML.getElementsByTagName("tutorial");
            var subID = getValByTag(subXML, "ID");
            for (var t = 0; t < tutorials.length; t++) {
                var cur = tutorials[t];
                var isSub = getValByTag(tutorials[t], "type") == "sub";
                var tutSubID = getValByTag(tutorials[t], "subID");
                if (isSub && tutSubID == subID) {
                    subject.tutorial = {};
                    subject.tutorial.name = getValByTag(tutorials[t], "name");
                    subject.tutorial.status = getValByTag(tutorials[t], "status");
                    tutorialXML = tutorials[t];
                }
            }
            subject.levels = [];
            var levelsXML = subXML.getElementsByTagName("level");
            for (var l = 0; l < levelsXML.length; l++) {
                var lvlXML = levelsXML[l];
                var level = {};
                level.name = getValByTag(lvlXML, "name");
                level.status = getValByTag(lvlXML, "status");
                level.num = l + 1;
                level.units = [];
                var unitsXML = lvlXML.getElementsByTagName("unit");
                for (var u = 0; u < unitsXML.length; u++) {
                    var unitXML = unitsXML[u];
                    var unit = {};
                    unit.name = getValByTag(unitXML, "name");
                    unit.status = getValByTag(unitXML, "status");
                    level.units.push(unit);
                }

                level.games = [];
                var gamesXML = lvlXML.getElementsByTagName("game");
                for (var u = 0; u < gamesXML.length; u++) {
                    var gameXML = gamesXML[u];
                    var game = {};
                    game.name = getValByTag(gameXML, "name");
                    game.icon = getValByTag(gameXML, "icon");
                    game.star1 = getValByTag(gameXML, "star1");
                    game.star2 = getValByTag(gameXML, "star2");
                    game.star3 = getValByTag(gameXML, "star3");
                    level.games.push(game);
                }

                subject.levels.push(level);
            }

            createElements(subject);
        } else {
            console.error("Bad XML");
            console.error(xml);
        }
    }
    function unitHTML(level) {
        var isNext = true;
        var blankSrc = "img/empty.png";
        var unitHTML = "";
        var nextUnitNum = 0;
        for (var u = 0; u < level.units.length; u++) {
            var unit = level.units[u];
            if (unit.status == "complete") {
                unitHTML += "<div class='unit complete'";
            } else if (isNext) {
                isNext = false;
                unitHTML += "<div class='unit next'";
                nextUnitNum = u + 1;
            } else {
                unitHTML += "<div class='unit incomplete'";
            }
            unitHTML += " loc='" + window.schoolLoc + "/" + window.curSubject + "/" + level.name + "/" + unit.name + "/index.html' ";
            unitHTML += " loc='" + window.schoolLoc + "/" + window.curSubject + "/" + level.name + "/" + unit.name + "/index.html' ";
            unitHTML += "subject='" + window.curSubject + "' ";
            unitHTML += "level='" + level.name + "' ";
            unitHTML += "unit='" + unit.name + "' >";

            unitHTML += "<div class=starHolder>";
            unitHTML += "<img class=smallStar src='img/smallStar.png' />";
            unitHTML += "<img class=bigStar src='img/bigStar.png' />";
            unitHTML += "</div>";

            unitHTML += "<img class=middle src=" + blankSrc + " />" +
                    "<span>" + (u + 1) + "</span>" +
                    "<img class=middle src=" + blankSrc + " />" +
                    "</div>";
        }
        var windowWidth = ($(document).width() - 100) * 0.75; // good
        var scrollWidth = (unitSize + 8) * nextUnitNum; // good

        var classes = level.status;
        if (level.status == "complete") {
            classes += " unlocked";
        }

        var ret = "<div class='blueBox " + classes + "' >";
        ret += "<div class=levelNameCont>";
        ret += "<img class='middle' src='" + blankSrc + "' />";
        ret += "<h3>" + level.name.toUpperCase() + "</h3>";
        ret += "<img class='lock' src='img/lock.png' />";
        ret += "</div>";
        ret += "<div class='unitCont'><div class='window'><div class='scrollCont' left=0 style='width:" + (level.units.length * (unitSize + 8)) + "px;' ><img class=middle />";
        ret += unitHTML;
        ret += "</div></div></div>";
        ret += "</div>";
        return ret;
    }
    function gameHTML(level) {
        var classes = level.status;
        if (level.status == "complete") {
            classes += " unlocked";
        }
        var ret = "<div class='blueBox " + classes + "' >";
        if (level.status !== "locked") {
            // Works for 1 2 or 3 games
            var gamesToMake = [0, 0, 0];
            var totGames = 0;
            for (var g = 0; g < level.games.length; g++) {
                var gameNum = level.games[g].name.split(" ")[1] - 1;
                if (!gamesToMake[gameNum]) {
                    totGames++;
                }
                gamesToMake[gameNum]++;
            }
            ret += "<span class=middle ></span>";
            var gd = -1;
            for (var g = 0; g < gamesToMake.length; g++) {
                if (level.games[g]) {
                    gd += gamesToMake[g];
                    var curGame = level.games[gd];
                    ret += "<img difficulties='" + gamesToMake[g] + "' class='gameIcon totGames" + totGames +
                            "' src='" + window.schoolLoc + "/" + window.curSubject + "/icons/" + curGame.icon + "'" +
                            " game='" + (g + 1) + "'" +
                            " level='" + level.name + "'" +
                            " loc='" + window.schoolLoc + "/" + window.curSubject + "/" + level.name + "/Game " + (g + 1) + "' />"
                } else {
                    // no game
                }
            }
        } else {
            ret += "<div style='display:none;'>"; // Susan asked to get rid of "Unlock level 2"
            ret += "<img class='middle' src='img/empty.png' />";
            ret += "<h3>" + translations.unlock + " " + level.name + "</h3>";
            ret += "<img class='lock' src='img/lock.png' />";
            ret += "</div>";
        }

        ret += "</div>";
        return ret;
    }
    function headerHTML(name, locked, additionalAttributes) {
        if (!locked) {
            locked = "";
        }
        var ret = {};
        ret.cols = [];
        ret.cols.push({gravity: 0.05});
        var attrs = "";
        for (var a = 0; a < additionalAttributes.length; a++) {
            attrs += " " + additionalAttributes[a][0] + "='" + additionalAttributes[a][1] + "'";
        }
        ret.cols.push({height: window.barHeight, template: "<div class='blueBox " + locked + "' id=subjectHeader " + attrs + "><span></span><img src='img/Button_Play.png' /><h2>" + name + "</h2></div>"});
        ret.cols.push({gravity: 0.05});
        return ret;
    }
    function subjectObj(subject) {
        var sub = {};
        sub.css = "tabletBG";
        sub.rows = [];
        sub.rows.push({}); // spacer
        var tutorialLoc = window.schoolLoc + "/tutorials/" + subject.tutorial.name + "/index.html";
        sub.rows.push(headerHTML(subject.displayName, "unlocked", [["loc", tutorialLoc]]));
        sub.rows.push({}); // spacer
        sub.rows.push({}); // spacer

        for (var l = 0; l < subject.levels.length; l++) {
            var level = subject.levels[l];
            var lvl = {};
            lvl.height = window.barHeight + 2;
            lvl.cols = [];
            lvl.cols.push({gravity: 0.075}); // left margin
            lvl.cols.push({height: window.barHeight, gravity: 3, template: unitHTML(level)}); // Lessons
            lvl.cols.push({width: 50, template: "<img class=middle /><div class='unitsToGamesLine'></div>"}); // Connecter
            lvl.cols.push({height: window.barHeight, gravity: 1.45, template: gameHTML(level)}); // Games
            lvl.cols.push({gravity: 0.075}); // right margin
            sub.rows.push(lvl);
            sub.rows.push({});
        }
        sub.rows.push({});
        return sub;
    }
    function createElements(subject) {
        webix.ui(subjectObj(subject));
        var downEvt = "touchstart";
        var moveEvt = "touchmove";
        var upEvt = "touchend";
        var outEvt = "mouseout"; //???
        if (device.platform == "browser") {
            downEvt = "mousedown";
            moveEvt = "mousemove";
            upEvt = "click";
            outEvt = "mouseout";
        }
        // $(".unit").on(eventName, unitClick);
        $(".gameIcon").on(upEvt, gameClick);
        $("#subjectHeader").on(upEvt, tutorialClick);

        window.mouseEvent = new MouseEvent(unitSize + 8);

        // $(".unit").on(upEvt, unitClick);

        $(".scrollCont").on(downEvt, window.mouseEvent.down);
        $(".scrollCont").on(upEvt, window.mouseEvent.up);
        $(".scrollCont").on(outEvt, window.mouseEvent.up);
        $(".scrollCont").on(moveEvt, window.mouseEvent.move);

        // center align the units and disable scrolling if width of viewport is bigger than width of units.
        /*
         for (var sc = 0; sc < $(".scrollCont").length; sc++) {
         if ($($(".scrollCont")[sc]).width() < $($(".unitCont")[sc]).width()) {
         var dif = $($(".unitCont")[sc]).width() - $($(".scrollCont")[sc]).width();
         $($(".scrollCont")[sc]).css("margin-left", dif / 2);
         $($(".scrollCont")[sc]).attr("left", dif / 2);
         $($(".scrollCont")[sc]).attr("ignoreMove", true);
         }
         }
         */


        $(".unit").css({"height": unitSize, "width": unitSize});

        //here
        var unitConts = $(".unitCont");
        for (var u = 0; u < unitConts.length; u++) {
            var scrollWindow = $(unitConts[u]);
            var windowWidth = scrollWindow.width();
            var scrollCont = scrollWindow.find(".scrollCont");
            var scrollWidth = scrollCont.width();
            var nextUnit = scrollCont.find(".unit").length - 1;
            for (var book = 0; book < scrollCont.find(".unit").length; book++) {
                var unit = $(scrollCont.find(".unit")[book]);
                if (!unit.hasClass("complete")) {
                    nextUnit = book;
                    book = scrollCont.find(".unit").length;
                }
            }
            var unitWidth = (unit.width() + 8);
            var nextAtLeft = unitWidth * nextUnit * -1;
            var nextAtRight = Math.min(0, nextAtLeft + windowWidth - unitWidth);
            scrollCont.css({"margin-left": nextAtRight});
            scrollCont.attr("left", nextAtRight);
        }

        spaceUnits(unitSize + 8);
    }
});

function spaceUnits(itemSize) {
    var scrolls = $(".scrollCont");
    var windowWidth = $(".window").width();
    for (var s = 0; s < scrolls.length; s++) {
        var scroll = $(".scrollCont")[s];
        var unitCount = $(scroll).find(".unit").length;
    }
}

function MouseEvent(itemSize) {
    var THIS = this;
    this.itemSize = itemSize;
    this.orig = false;
    this.latestLoc = false;
    this.mDown = false;
    this.windowWidth = $(".window").width();
    this.dragDistOffsetMet = false;
    this.dragTimeOffsetMet = false;
    this.hasMoved = false;
    this.overflow = 0;
    this.retX = function (e) {
        if (e.originalEvent.touches) {
            return e.originalEvent.touches[0].pageX;
        } else {
            return e.pageX;
        }
    }
    this.down = function (e) {
        THIS.orig = THIS.retX(e);
        THIS.latestLoc = THIS.orig + 0;
        THIS.orig -= parseFloat($(this).attr("left"));
        THIS.mDown = true;
        THIS.scrollWidth = $(this).width();
        THIS.overflow = -1 * (THIS.scrollWidth - THIS.windowWidth);
        THIS.dragTimeOffsetMet = window.setTimeout(function () {
            window.clearTimeout(THIS.dragTimeOffsetMet);
            THIS.dragTimeOffsetMet = false;
        }, 200);
    }
    this.up = function (e) {
        THIS.mDown = false;
        var clickedUnit = false;
        var curX = THIS.latestLoc;
        var curLeft = $(this).attr("left");
        if (curX && !THIS.hasMoved) {
            if (Math.abs(curX - (THIS.orig + parseFloat(curLeft))) < THIS.itemSize / 4 && THIS.dragTimeOffsetMet) {
                var marginOffset = $(this).parent().parent().offset().left;
                var unitNum = Math.abs(Math.floor((curLeft - curX + marginOffset) / THIS.itemSize)) - 1;
                clickedUnit = $(this)[0].getElementsByClassName("unit")[unitNum];
            } else {
                // console.log("end drag");
            }
        }
        THIS.orig = false;
        THIS.latestLoc = false;
        THIS.dragDistOffsetMet = false;
        window.clearTimeout(THIS.dragTimeOffsetMet);
        THIS.dragTimeOffsetMet = false;
        THIS.dragStarted = false;
        THIS.hasMoved = false;

        if (clickedUnit) {
            unitClick.call(clickedUnit);
        }
    }
    this.move = function (e) {
        if ($(this).attr("ignoreMove")) {
        } else {
            if (THIS.mDown) {
                if (THIS.dragDistOffsetMet) {
                    THIS.hasMoved = true;
                    var dif = THIS.retX(e);
                    THIS.latestLoc = dif + 0;
                    dif -= THIS.orig;
                    dif = Math.min(dif, 0); // Keep it from going off screen right
                    dif = Math.max(dif, THIS.overflow);
                    $(this).css("margin-left", dif);
                    $(this).attr("left", dif);
                } else {
                    var curLeft = parseFloat($(this).attr("left"));
                    if (Math.abs(THIS.retX(e) - (THIS.orig + curLeft)) > THIS.itemSize / 4) {
                        THIS.dragDistOffsetMet = true;
                    }
                }
            }
        }
    }
}


function getValByTag(node, tag) {
    if (node && node.getElementsByTagName(tag).length && node.getElementsByTagName(tag)[0].innerHTML) {
        return node.getElementsByTagName(tag)[0].innerHTML;
    } else {
        return false;
    }
}
function tutorialClick() {
    var lvls = window.subjectXML.getElementsByTagName("level")[0];
    var tut = window.tutorialXML;
    var tutName = getValByTag(tut, "name");
    lvls.getElementsByTagName("status")[0].childNodes[0].nodeValue = "unlocked";
    var previouslyLocked;
    if (getValByTag(tut, "status") == "incomplete") {
        previouslyLocked = true;
    } else {
        previouslyLocked = false;
    }
    tut.getElementsByTagName("status")[0].childNodes[0].nodeValue = "complete";

    var loc = $(this).attr("loc");
    var serverLoc = window.schoolName + "_zip/" + tutName + "_Tutorial.zip";
    saveAndGo(window.xml, loc, serverLoc, true);
}
function unitClick() {
    if (window.xml) {
        var subjectName = $(this).attr("subject");
        var levelName = $(this).attr("level");
        var unitName = $(this).attr("unit");
        var loc = $(this).attr("loc");
        var unlocked = $(this).hasClass("complete");

        var serverLoc = window.schoolName + "_zip/" + window.subjectName + "/" + levelName + "/" + unitName + ".zip";
        var unitLoc = [window.schoolName, window.subjectName, levelName, unitName];
        updateXML(window.xml, window.userXML, unitLoc, false, function (url) {
            checkDownloadAndGo(url);
        })
    } else {
        console.error("Error: Cannot find XML to save progress");
    }
}


function coverUp() {
    $("#cover").css("display", "block");
    var eventName = "touchend";
    if (device.platform == "browser") {
        eventName = "click";
    }
    $("#cover").on(eventName, function () {
        if ($$("downloadWindow")) {
            $$("downloadWindow").close();
        }
        $("#cover").css("display", "none");
    })
}

function gameClick(elem) {
    var gameIcon = $(this).attr("src");
    var gameNum = $(this).attr("game");
    var partialLoc = $(this).attr("loc");
    var curLevel = $(this).attr("level");
    var difficulties = Math.round($(this).attr("difficulties"));
    var starHTML = "<div id='starCont'>";
    for (var d = 0; d < difficulties; d++) {
        starHTML += "<img class='star' id='star" + (d + 1) + "o" + difficulties + "' src='img/star" + (d + 1) + ".png' />";
    }
    starHTML += "<img id='gameImg' src='" + gameIcon + "' />";
    // starHTML += "<img id='screw' src='img/centerGameScrew.png' />";
    starHTML += "</div>";
    coverUp();
    webix.ui({
        view: "window",
        container: "cover",
        id: "downloadWindow",
        css: "gameCont",
        position: "center",
        // head: translations.game + " " + gameNum,
        head: {
            view: "toolbar", margin: -4, css: "white", cols: [
                {},
                {view: "icon", icon: "times-circle", css: "exitBtn", click: "$$('downloadWindow').close()", align: "right", },
            ]
        },
        body: {
            height: 350,
            width: 350,
            template: "<div id='gameSelector'>" +
                    starHTML +
                    "</div>"
        },
    }).show();
    var eventName = "touchend";
    if (device.platform == "browser") {
        eventName = "click";
    }
    $(".star").on(eventName, function () {
        var gameDif = $(this).attr("id").charAt(4);
        var gameLoc = [window.schoolName, window.subjectName, curLevel, "Game " + gameNum + " dif " + gameDif];
        updateXML(window.xml, window.userXML, false, gameLoc, function (url) {
            window.location.href = url;
        })
    });
}

function saveAndGo(xml, loc, partialServerLoc, unlocked) {
    var xmlText = new XMLSerializer().serializeToString(xml);
    overwriteFile("users/" + window.userID + "/school.xml", xmlText, function () {
        var users = window.userXML.getElementsByTagName("user");
        for (var u = 0; u < users.length; u++) {
            if (getValByTag(users[u], "id") == window.userID) {
                var prevUnitsRead = parseFloat(getValByTag(users[u], "prevUnitsRead"));
                if (!unlocked) {
                    // var val = 0.1 + (Math.round((Math.random() / 8 * 100)) / 100); // between 0.1 and 0.23
                    //  level += val;
                    prevUnitsRead += 1;
                } else {
                    // level += Math.round((Math.random() / 10) * 100) / 100;
                }

                users[u].getElementsByTagName("prevUnitsRead")[0].childNodes[0].nodeValue = prevUnitsRead;
                var xmlText = new XMLSerializer().serializeToString(window.userXML);
                overwriteFile("users.xml", xmlText, function () {
                    checkDownloadAndGo(loc, partialServerLoc);
                });
            }
        }
    });
}




function addAccentStyle(color) {
    /*
     *
     .blueBox, .unit.complete, .unit.next {
     border-color:blue
     }
     .blueBox, .unitsToGamesLine, .unit.complete, #starCont {
     background-color:blue;
     }
     .blueBox h1, .blueBox.unlocked h2, .blueBox.unlocked h3, .unit.next span {
     color:blue;
     }
     *
     */

    // ugly, but I'll be damned if I use sass for one stupid thing.
    $('head').append(
            "<style>" +
            ".blueBox, .unit.complete, .unit.next {" +
            "\r\t border-color:" + color + ";" +
            "\r}\r" +
            ".blueBox, .unitsToGamesLine, .unit.complete, #starCont {" +
            "\r\t background-color:" + color + ";" +
            "\r}\r" +
            ".blueBox h1, .blueBox.unlocked h2, .blueBox.unlocked h3, .unit.next span {" +
            "\r\t color:" + color + ";" +
            "\r}\r" +
            "</style>"
            )
}


