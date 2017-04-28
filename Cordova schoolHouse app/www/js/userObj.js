// needed after here
function getValByTag(node, tag) {
    if (node && node.getElementsByTagName(tag).length && node.getElementsByTagName(tag)[0].innerHTML) {
        return node.getElementsByTagName(tag)[0].innerHTML;
    } else {
        return false;
    }
}

function updateXML(schoolXML, usersXML, unitLoc, gameLoc, callback) {
    if (typeof schoolXML == "string") {
        this.schoolXML = $.parseXML(schoolXML);
    } else {
        this.schoolXML = $.parseXML(new XMLSerializer().serializeToString(schoolXML));
    }
    if (typeof usersXML == "string") {
        this.usersXML = $.parseXML(usersXML);
    } else {
        this.usersXML = $.parseXML(new XMLSerializer().serializeToString(usersXML));
    }
    if (unitLoc) {
        this.schoolName = unitLoc[0];
        this.subjectName = unitLoc[1];
        this.levelName = unitLoc[2];
        this.unitName = unitLoc[3];
    } else if (gameLoc) {
        this.schoolName = gameLoc[0];
        this.subjectName = gameLoc[1];
        this.levelName = gameLoc[2];
        this.gameName = gameLoc[3];
    }
    var finishedLesson = false;
    var finishedGame = false;
    var finishedLevel = true;

    var subjects = this.schoolXML.getElementsByTagName("subject");
    for (var s = 0; s < subjects.length; s++) {
        var subject = subjects[s];
        var subName = getValByTag(subject, "name");
        if (subName == this.subjectName) {
            var levels = subject.getElementsByTagName("level");
            for (var l = 0; l < levels.length; l++) {
                var level = levels[l];
                var lvlName = getValByTag(level, "name");
                if (lvlName == this.levelName) {
                    var bookStr = (unitLoc) ? "unit" : "game";
                    var books = level.getElementsByTagName(bookStr);
                    for (var b = 0; b < books.length; b++) {
                        var book = books[b];

                        var bookName = getValByTag(book, "name");

                        if (this.unitName && this.unitName == bookName ||
                          this.gameName && this.gameName == bookName) {
                            var status = getValByTag(book, "status");
                            if (status == "complete") {
                                // rereading, no change
                            } else {
                                if (status == "incomplete") {
                                    // node there, change it
                                    book.getElementsByTagName("status")[0].childNodes[0].nodeValue = "complete";
                                } else if (!status) {
                                    // no node, need to make
                                    var status = this.schoolXML.createElement("status");
                                    status.innerHTML = "complete";
                                    book.appendChild(status);
                                }
                                if (unitLoc) {
                                    finishedLesson = 1;
                                } else if (gameLoc) {
                                    finishedGame = 1;
                                }
                            }
                        } else {
                            if (unitLoc) {
                                if (getValByTag(book, "status") == "incomplete") {
                                    finishedLevel = false;
                                }
                            }
                        }
                    }
                    // Can only finish level by completing last LESSON, not game.
                    if (finishedLevel && unitLoc) {
                        // set current level to "complete"
                        level.getElementsByTagName("status")[0].childNodes[0].nodeValue = "complete";
                        // set next level to "unlocked"
                        if (levels[l + 1]) {
                            levels[l + 1].getElementsByTagName("status")[0].childNodes[0].nodeValue = "unlocked";
                        }
                        finishedLevel = 1;
                    }
                }
            }
        }
    }
    var totSchoolUnits = this.schoolXML.getElementsByTagName("unit").length;
    var totSchoolGames = this.schoolXML.getElementsByTagName("game").length;
    var totSchoolLevels = this.schoolXML.getElementsByTagName("level").length;
    if (finishedLesson || finishedGame || finishedLevel) {
        var users = this.usersXML.getElementsByTagName("user");
        for (var u = 0; u < users.length; u++) {
            var user = users[u];
            var tmpID = getValByTag(user, "id");
            if (tmpID == window.userID) {
                var unitsRead = getValByTag(users[u], "unitsRead") * 1;
                var gamesWon = getValByTag(users[u], "gamesWon") * 1;
                var levelsUnlocked = getValByTag(users[u], "levelsUnlocked") * 1;

                if (finishedLesson === 1) {
                    var prevVal = getValByTag(user, "unitsRead") * 1;
                    user.getElementsByTagName("prevUnitsRead")[0].childNodes[0].nodeValue = prevVal;
                    user.getElementsByTagName("unitsRead")[0].childNodes[0].nodeValue = prevVal + 1;
                    unitsRead++;
                }
                if (finishedGame === 1) {
                    var prevVal = getValByTag(user, "gamesWon") * 1;
                    user.getElementsByTagName("prevGamesWon")[0].childNodes[0].nodeValue = prevVal;
                    user.getElementsByTagName("gamesWon")[0].childNodes[0].nodeValue = prevVal + 1;
                    gamesWon++;
                }
                if (finishedLevel === 1) {
                    var prevVal = getValByTag(user, "levelsUnlocked") * 1;
                    user.getElementsByTagName("prevLevelsUnlocked")[0].childNodes[0].nodeValue = prevVal;
                    user.getElementsByTagName("levelsUnlocked")[0].childNodes[0].nodeValue = prevVal + 1;
                    levelsUnlocked++;
                }

                var maxLevelAbs = totSchoolUnits + totSchoolGames + (totSchoolLevels * 3);
                var curLevelAbs = unitsRead + gamesWon + (levelsUnlocked * 3);
                var curLevel = Math.round((1 + Math.round((curLevelAbs / maxLevelAbs) * 900) / 90) * 100) / 100;
                user.getElementsByTagName("level")[0].childNodes[0].nodeValue = curLevel;
            }
        }
    }
    var userText = new XMLSerializer().serializeToString(this.usersXML);
    var schoolText = new XMLSerializer().serializeToString(this.schoolXML);
    var bookName = "";
    if (unitLoc) {
        bookName = this.unitName;
    } else {
        bookName = this.gameName;
    }
    var url = "school/" + this.subjectName + "_" + this.levelName + "_" + bookName + "/index.html";

    if (typeof overwriteFile == "undefined") {
        callback(url);
    } else {
        overwriteFile("users.xml", userText, function () {
            overwriteFile("users/" + window.userID + "/school.xml", schoolText, function () {
                callback(url);
            });
        });
    }
}
function User(schoolXML, usersXML) {
    var THIS = this;
    this.usersXML = false;
    this.schoolXML = false;
    if (typeof schoolXML == "string") {
        this.schoolXML = $.parseXML(schoolXML);
    } else {
        this.schoolXML = $.parseXML(new XMLSerializer().serializeToString(schoolXML));
    }
    if (typeof usersXML == "string") {
        this.usersXML = $.parseXML(usersXML);
    } else {
        this.usersXML = $.parseXML(new XMLSerializer().serializeToString(usersXML));
    }
    this.totSchoolUnits = this.schoolXML.getElementsByTagName("unit").length;
    this.totSchoolGames = this.schoolXML.getElementsByTagName("game").length;
    this.totSchoolLevels = this.schoolXML.getElementsByTagName("level").length;
    this.name;
    this.unitsRead;
    this.prevUnitsRead;
    this.animationQueue = [];
    this.ready = false;

    this.load = function () {
        if (this.usersXML) {
            var users = this.usersXML.getElementsByTagName("user");
            for (var u = 0; u < users.length; u++) {
                if (getValByTag(users[u], "id") == userID) {
                    THIS.name = getValByTag(users[u], "name");
                    THIS.picture = getValByTag(users[u], "picture");
                    THIS.unitsRead = getValByTag(users[u], "unitsRead") * 1;
                    THIS.prevUnitsRead = getValByTag(users[u], "prevUnitsRead") * 1;
                    THIS.gamesWon = getValByTag(users[u], "gamesWon") * 1;
                    THIS.prevGamesWon = getValByTag(users[u], "prevGamesWon") * 1;
                    THIS.levelsUnlocked = getValByTag(users[u], "levelsUnlocked") * 1;
                    THIS.prevLevelsUnlocked = getValByTag(users[u], "prevLevelsUnlocked") * 1;
                    THIS.schoolComplete = getValByTag(users[u], "schoolComplete") * 1;
                    var maxLevelAbs = THIS.totSchoolUnits + THIS.totSchoolGames + (THIS.totSchoolLevels * 3);
                    var prevLevelAbs = THIS.prevUnitsRead + THIS.prevGamesWon + (THIS.prevLevelsUnlocked * 3);
                    var curLevelAbs = THIS.unitsRead + THIS.gamesWon + (THIS.levelsUnlocked * 3);
                    // todo: make straight graph into bendy curvy graph.
                    THIS.prevLevel = Math.round((1 + Math.round((prevLevelAbs / maxLevelAbs) * 900) / 90) * 100) / 100;
                    THIS.level = Math.round((1 + Math.round((curLevelAbs / maxLevelAbs) * 900) / 90) * 100) / 100;
                    users[u].getElementsByTagName("level")[0].childNodes[0].nodeValue = THIS.level;
                    users[u].getElementsByTagName("prevUnitsRead")[0].childNodes[0].nodeValue = THIS.unitsRead;
                    users[u].getElementsByTagName("prevGamesWon")[0].childNodes[0].nodeValue = THIS.gamesWon;
                    users[u].getElementsByTagName("prevLevelsUnlocked")[0].childNodes[0].nodeValue = THIS.levelsUnlocked;
                    var userText = new XMLSerializer().serializeToString(this.usersXML);
                    overwriteFile("users.xml", userText, function () {
                        // console.log("updated");
                    });

                    u = users.length;
                    THIS.checkReady();
                }
            }
        }
    }
    this.show = function (callback) {
        if ($("#avatar")[0]) {
// make shit for school page
        } else {
            var prevLevel = this.prevLevel.toString().split(".");
            if (!prevLevel[1]) {
                prevLevel[1] = 0;
            }

            var html = "" +
              "<div id=userClose style='display:none'>" +
              "<div id=userCover>" +
              "<div id=badgeCont>" +
              "<div id=gameBadgeCover></div>" +
              "<div id=levelBadgeCover></div>" +
              "</div>" +
              "<img id=avatar src='" + this.picture + "?" + Math.random() + "' />" +
              '<div class="levelCont" style="display: block;">' +
              '<div class="level" level=' + prevLevel[0] + '>' +
              '<div class="percentToNext" style="width: ' + (("." + prevLevel[1]) * 100) + '%;"></div>' +
              '</div>' +
              '<h4 class="levelAt">' + prevLevel[0] + '</h4>' +
              '</div>' +
              '</div>' +
              '<div id=audioCont style="display:none">' +
              "<audio id=sparkleShort src='" + window.schoolLoc + "/fx/sparkle_short.ogg' />" +
              "<audio id=iceChimes src='" + window.schoolLoc + "/fx/ice chimes.ogg' />" +
              "<audio id=harpUp src='" + window.schoolLoc + "/fx/harp up.ogg' />" +
              "<audio id=harpUpD src='" + window.schoolLoc + "/fx/harp up d.ogg' />" +
              '</div>' +
              '</div>';
            $(html).appendTo(document.body);
            $("#userClose").css({height: "100%", width: "100%", position: "absolute", "z-index": 999, "background-color": "RGBA(20,20,20,0.5)"});
            var eventName = "touchend";
            if (typeof device == "undefined" || device.platform == "browser") {
                eventName = "click";
            }
            $("#userClose").on(eventName, function () {
                $(this).animate({"opacity": 0}, 100, function () {
                    $(this).remove();
                });
            });
            var height = $("#userClose").height();
            var width = $("#userClose").width();
            var coverHeight = 330;
            var coverWidth = 570;
            $("#userCover").css({
                height: coverHeight,
                width: coverWidth,
                "margin-top": (height - coverHeight) / 2,
                "margin-left": (width - coverWidth) / 2,
                padding: 7.5});
            $("#avatar").css({height: 315, width: 555, opacity: 0});
            $("#badgeCont").css({height: 330, width: 570, opacity: 0});
            $(".levelCont").css({"margin-top": -170, "padding-left": 0, "padding-right": 0, width: "80%", "margin-left": "10%", opacity: 0});
            for (var g = 0; g < this.prevGamesWon; g++) {
                $("<div class=gameBadgeAbsFix ><img class=gameBadge src='" + window.schoolLoc + "/icons/gameBadge.png' /></div>").appendTo("#gameBadgeCover");
            }
            for (var l = 0; l < this.prevLevelsUnlocked; l++) {
                $("<div class=levelBadgeAbsFix ><img class=levelBadge src='" + window.schoolLoc + "/icons/levelBadge.png' /></div>").appendTo("#levelBadgeCover");
            }
            if (this.gamesWon == 0) {
                $("#gameBadgeCover").css({"display": "none"});
            }
            if (this.levelsUnlocked == 0) {
                $("#levelBadgeCover").css({"display": "none"});
            }
            if (this.level == 1) {
                $(".levelCont").css({"margin-top": 15, width: 100 + "%", "margin-left": 0 + "%"});
            }

            $("#avatar").one("load", function () {
                $("#userClose").css("display", "block");
                $("#avatar").animate({"opacity": 1}, 500, function () {
                    $("#badgeCont").animate({opacity: 1}, 500, function () {
                        $(".levelCont").animate({opacity: 1}, 500, function () {
                            callback();
                        });
                    });
                });
            }).each(function () {
                if (this.complete)
                    $(this).load();
            });
        }
    }
    this.animateProgress = function () {
        var next = function () {
            THIS.animationQueue.shift();
            if (THIS.animationQueue[0]) {
                if (THIS.animationQueue[0] == "progress") {
                    animateProgress();
                } else if (THIS.animationQueue[0] == "games") {
                    animateGame();
                } else if (THIS.animationQueue[0] == "levels") {
                    animateLevel();
                } else if (THIS.animationQueue[0] == "school") {
                    animateSchool();
                }
            }
        }
        var animateProgress = function () {
            var start = Math.round(THIS.prevLevel * 100) / 100;
            var end = Math.round(THIS.level * 100) / 100;
            var startInt = start.toString().split(".")[0];
            var startDec = start.toString().split(".")[1];
            startDec = Math.round(("." + startDec) * 100);
            var endInt = end.toString().split(".")[0];
            var endDec = end.toString().split(".")[1];
            endDec = Math.round(("." + endDec) * 100);
            if (isNaN(endDec)) {
                endDec = 0;
            }
            if (isNaN(startDec)) {
                startDec = 0;
            }
            $("#harpUp")[0].play();
            if (endInt * 1 > startInt * 1) {
                // full level grow
                $(".percentToNext").animate({width: "100%"}, 750, function () {
                    if (endDec == 0) {
                        $(".levelAt").animate({opacity: 0}, 200, function () {
                            $(".levelAt").html(endInt);
                            $(".levelAt").animate({opacity: 1}, 200, function () {
                                $(".levelAt").animate({opacity: 0}, 100, function () {
                                    $(".levelAt").animate({opacity: 1}, 100, function () {
                                        $(".levelAt").animate({opacity: 0}, 100, function () {
                                            $(".levelAt").animate({opacity: 1}, 100, function () {
                                                $(".levelCont").animate({"margin-top": 15, width: 100 + "%", "margin-left": 0 + "%"}, 750, function () {
                                                    next();
                                                })
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    } else {
                        $(".levelAt").animate({opacity: 0}, 150, function () {
                            $(".levelAt").html(endInt);
                            $(".levelAt").animate({opacity: 1}, 150);
                        });
                        $(".percentToNext").animate({opacity: 0}, 500, function () {
                            $("#harpUpD")[0].play();
                            $(".percentToNext").css({opacity: 1, width: "0%"});
                            $(".percentToNext").animate({width: endDec + "%"}, 750, function () {
                                $(".levelCont").animate({"margin-top": 15, width: 100 + "%", "margin-left": 0 + "%"}, 750, function () {
                                    next();
                                })
                            });
                        });
                    }
                });
            } else {
                $(".percentToNext").animate({width: endDec + "%"}, 1250, function () {
                    $(".levelCont").animate({"margin-top": 15, width: 100 + "%", "margin-left": 0 + "%"}, 750, function () {
                        next();
                    })
                });
            }

        }
        var animateGame = function () {
            $("<div class=gameBadgeAbsFix ><img class=gameBadge style='opacity:0;' src='" + window.schoolLoc + "/icons/gameBadge.png' /></div>").appendTo("#gameBadgeCover");
            var marginLeft = 255 - ((THIS.prevGamesWon % 9) * 15) + 25;
            $("#sparkleShort")[0].play();
            $(".gameBadge").last().css({"margin-top": 50, "margin-left": marginLeft, height: 50, width: 50});
            $(".gameBadge").last().animate({"opacity": 1}, 500, function () {
                $(".gameBadge").last().animate({"margin-top": 0, "margin-left": 0, height: 15, width: 15}, 1000, function () {
                    next();
                });
            });
        }
        var animateLevel = function () {
            $("<div class=levelBadgeAbsFix ><img class=levelBadge style='opacity:0;' src='" + window.schoolLoc + "/icons/levelBadge.png' /></div>").appendTo("#levelBadgeCover");
            var marginLeft = -1 * (255 - ((THIS.prevGamesWon % 4) * 33.33)) + 25;
            $("#iceChimes")[0].play();
            $(".levelBadge").last().css({"margin-top": 50, "margin-left": marginLeft, height: 50, width: 50});
            $(".levelBadge").last().animate({"opacity": 1}, 500, function () {
                $(".levelBadge").last().animate({"margin-top": 0, "margin-left": 0, height: 30, width: 30}, 1000, function () {
                    next();
                });
            });
        }
        var animateSchool = function () {

        }
        if (this.animationQueue.length) {
            this.animationQueue.unshift("end");
            next();
        }
    }
    this.checkLevelUp = function () {
        if (this.level > this.prevLevel) {
            this.animationQueue.push("progress");
        }
        if (this.gamesWon > this.prevGamesWon) {
            this.animationQueue.push("games");
        }
        if (this.levelsUnlocked > this.prevLevelsUnlocked) {
            this.animationQueue.push("levels");
        }
        if (!this.schoolComplete && this.unitsRead == this.totSchoolUnits && this.gamesWon == this.totSchoolGames) {
            this.animationQueue.push("school");
        }
        this.animationQueue = []; // Susan didn't like... and I guess it wasn't amazing anyway... Yes these grapes do taste sour.
        if (this.animationQueue.length) {
            this.show(function () {
                THIS.animateProgress();
            });
        }
    }
    this.checkReady = function () {
        if (this.schoolXML && this.usersXML) {
            this.ready = true;
            THIS.checkLevelUp();
        }
    }
    this.displayLevel = function () {
        this.load();
    }
    this.displayLevel();
}

