document.addEventListener("deviceready", function () {
    window.addEventListener("batterystatus", onBatteryStatus, false);

    viewportFix();
    login(function (userID, schoolXML) {
        schoolXML = $.parseXML(schoolXML);
        window.schoolXML = schoolXML;
        window.schoolName = getValByTag(schoolXML, "name");
        window.userID = userID;
        readFile("users.xml", function (usersXML) {
            if (usersXML) {
                usersXML = $.parseXML(usersXML);
                window.userXML = usersXML;
                var users = usersXML.getElementsByTagName("user");
                for (var u = 0; u < users.length; u++) {
                    if (getValByTag(users[u], "id") == userID) {
                        if ($ && $("#avatar")[0]) {
                            var userPic = getValByTag(users[u], "picture");
                            $("#avatar")[0].src = userPic + "?" + Math.random(); // prevent cache?
                            $("#avatar")[0].onload = function () {
                                // set level width to picture width. Why not a set width for both? Different sized pictures on different sized tablets.
                                var imgWidth = $("#avatar").width();
                                // $(".level").css("width", imgWidth + "px");
                                // actually, forget all that, because 100% works just fine.
                            };
                            var eventName = "touchend";
                            if (device.platform == "browser") {
                                eventName = "click";
                            }
                            $("#avatar").on(eventName, retakePicture);

                            var level = getValByTag(users[u], "level");
                            $(".level").attr("level", level);
                            var curLevel = level.split(".")[0];
                            var nextPercent = level.split(".")[1];
                            if (isNaN(nextPercent)) {
                                nextPercent = "0";
                            }
                            nextPercent = "0." + nextPercent;
                            nextPercent = parseFloat(nextPercent);
                            nextPercent *= 100;
                            $(".percentToNext").css("width", nextPercent + "%");
                            $(".levelAt").html(curLevel);
                            $(".levelCont").css("display", "block");
                        }
                    }
                }
                parseXml(schoolXML);
            } else {
                window.location.href = "login.html";
            }
        })
    }, function () {
        window.location.href = "login.html";
    })



    function failXML(err, xhr) {
        var errStr = JSON.stringify(err, null, 4);
        console.log(errStr);
        var xhrStr = JSON.stringify(xhr, null, 4);
        console.log(xhrStr);
    }
    function parseXml(xml) {
        if (xml) {
            var totCols = getValByTag(xml, "colCount");
            var totRows = getValByTag(xml, "rowCount");
            var bgSrc = getValByTag(xml, "schoolBG");
            if (bgSrc) {
                $(".tabletBG").css({"background-image": "url(" + window.schoolLoc + "/icons/" + bgSrc + ")"});
            }
            var tutorialXML = xml.getElementsByTagName("tutorial")[0];
            var tutorialActive = getValByTag(tutorialXML, "active");
            $("#tutorialSchoolElem").css({"display": "block"});
            $("#tutorialSchoolElem").find("img").attr("src", "img/openTutorials.png");
            $("#tutorialSchoolElem").addClass("picture");
            $("#tutorialSchoolElem").removeClass("text");
            
            $("#booksElem").css({"display": "block"});
            $("#booksElem").find("img").attr("src", "img/openBooks.png");
            $("#booksElem").addClass("picture");
            $("#booksElem").removeClass("text");

            /*
             var scrapbookXML = xml.getElementsByTagName("scrapbook")[0];
             var scrapbookActive = getValByTag(scrapbookXML, "active");
             if (scrapbookActive) {
             $("#scrapbookSchoolElem").css({"display": "block"});
             window.ignoreScrapbookToggle = true;
             var scrapbookIcon = getValByTag(scrapbookXML, "icon");
             if (scrapbookIcon) {
             $("#scrapbookSchoolElem").find("img").attr("src", window.schoolLoc + "/icons/" + scrapbookIcon);
             $("#scrapbookSchoolElem").addClass("picture");
             $("#scrapbookSchoolElem").removeClass("text");
             } else {
             $("#scrapbookSchoolElem").find("img").attr("src", "");
             $("#scrapbookSchoolElem").removeClass("picture");
             $("#scrapbookSchoolElem").addClass("text");
             }
             } else {
             }
             */


            var subjects = xml.getElementsByTagName("subject");
            for (var r = subjectRowNum; r > 1; r--) {
                modifySubjectGrid(0, 1, 1);
            }
            for (var c = subjectColNum; c > 1; c--) {
                modifySubjectGrid(0, 0, 1);
            }
            for (var c = 1; c < totCols; c++) {
                modifySubjectGrid(1, 0, 1);
            }
            for (var t = 1; t < totRows; t++) {
                modifySubjectGrid(1, 1, 1);
            }
            for (var s = 0; s < subjects.length; s++) {
                var subject = subjects[s];
                var cur = {};
                cur.name = getValByTag(subject, "name");
                cur.row = getValByTag(subject, "row");
                cur.col = getValByTag(subject, "col");
                cur.icon = getValByTag(subject, "icon");
                cur.iconHover = getValByTag(subject, "iconHover");
                cur.iconDown = getValByTag(subject, "iconDown");
                // Assign subjects to their prop places (subs[0].row and shit)
                var elem = $(document.querySelector('[view_id="grid_r' + cur.row + 'c' + cur.col + '"]')).find(".grid")[0];
                $(elem).find("h2").html(cur.name);
                $(elem).attr("subject", cur.name);
                if (cur.icon) {
                    $(elem).find("img").attr("src", window.schoolLoc + "/" + cur.name + "/icons/" + cur.icon);
                    $(elem).addClass("picture");
                    $(elem).removeClass("text");
                    $(elem).attr("iconHover", cur.iconHover);
                    $(elem).attr("iconDown", cur.iconDown);
                } else {
                    $(elem).removeClass("picture");
                    $(elem).addClass("text");
                }
            }
        } else {

        }
    }

    var tabletBorderMarginRatioVert = 0.1;
    var tabletBorderMarginRatioHori = 0.07143;

    var gridTemplate = "<div class='grid' subject='' onClick=gotoSubject(this)><h2></h2><img /></div>";
    var subjectRowNum = 3; //TODO: get this from XML
    var subjectColNum = 2;
    function modifySubjectGrid(isAdd, isRow, noAjax) {
        if (isAdd) {
            if (isRow) {
                if (subjectRowNum >= 10) {
                    webix.message("Come on man, make it work with 10 grid spaces will ya buddy?");
                } else {
                    subjectRowNum++;
                    var newRow = {
                        id: "subjectGridRow" + subjectRowNum, css: "gridRow gridRow" + subjectRowNum, cols: [],
                    }
                    for (var c = 1; c <= subjectColNum; c++) {
                        newRow.cols.push({
                            id: "grid_r" + subjectRowNum + "c" + c,
                            "template": gridTemplate,
                        });
                    }
                    $$("subjectGrid").addView(newRow);
                }
            } else {
                if (subjectColNum >= 10) {
                    webix.message("Come on man, make it work with 10 grid spaces will ya pal?");
                } else {
                    subjectColNum++;
                    for (var r = 1; r <= subjectRowNum; r++) {
                        $$("subjectGridRow" + r).addView({
                            id: "grid_r" + r + "c" + subjectColNum,
                            "template": gridTemplate,
                        });
                    }
                }
            }
        } else {
            if (isRow) {
                if (subjectRowNum < 2) {
                    webix.message("You have to have at least one, friend");
                } else {
                    $$("subjectGrid").removeView("subjectGridRow" + subjectRowNum);
                    subjectRowNum--;
                }

            } else {
                if (subjectColNum < 2) {
                    webix.message("You have to have at least one, guy");
                } else {
                    for (var r = 1; r <= subjectRowNum; r++) {
                        $$("subjectGridRow" + r).removeView("grid_r" + r + "c" + subjectColNum);
                    }
                    subjectColNum--;
                }
            }
        }

        if (!noAjax) {
            $.ajax("../ajax/set/setSchoolRowAndColCount.php?school=" + window.schoolLoc + "&rows=" + subjectRowNum + "&cols=" + subjectColNum).done(
              function (ret) {
                  if (ret == "done") {
                      webix.message("Rows modified");
                  } else {
                      // document.body.innerHTML = ret;
                  }
              });

        }
    }

    webix.ui({
        rows: [
            {
                cols: [
                    {
                        css: "tabletBG",
                        gravity: 1,
                        rows: [
                            {
                                gravity: 1,
                                cols: [
                                    {
                                        type: "spacer",
                                        gravity: 1,
                                        template: "<div id=tutorialSchoolElem class=solid><img id=openTuts><div id=cover><div id=tutorials><div id=slider left=0></div></div></div></div>"
                                    },

                                    {
                                        rows: [
                                            {
                                                type: "spacer",
                                                gravity: 2,
                                                template: "<img id='avatar' />"
                                            },
                                            {height: 35, template: '<div class="levelCont" style="display:none"><div class="level" level="1.55"><div class="percentToNext" style="width:06%;"></div></div><h4 class="levelAt">1</h4><div class="levelCont">'},
                                        ]
                                    },
                                    {
                                        type: "spacer",
                                        gravity: 1,
                                        template: "<div id=booksElem class=solid><img id=goBooks ></div>"
                                    },
                                ]
                            },
                            {
                                gravity: 2,
                                id: "subjectGrid",
                                rows: [
                                    {
                                        id: "subjectGridRow1", css: "gridRow gridRow1", cols: [
                                            {
                                                id: "grid_r1c1", "template": gridTemplate, on: {
                                                    onItemClick: function () {
                                                        console.log(this);
                                                    }
                                                }
                                            },
                                            {id: "grid_r1c2", "template": gridTemplate},
                                        ]
                                    },
                                    {
                                        id: "subjectGridRow2", css: "gridRow gridRow1", cols: [
                                            {id: "grid_r2c1", "template": gridTemplate},
                                            {id: "grid_r2c2", "template": gridTemplate},
                                        ]
                                    },
                                ]
                            }
                        ]
                    },
                ]
            },
        ]
    });


    function openTutorial() {
        //window.location.href = "";
        var tutorials = schoolXML.getElementsByTagName("tutorial");
        var tutsHTML = "";
        var totTuts = 0;
        for (var t = 0; t < tutorials.length; t++) {
            if (getValByTag(tutorials[t], "icon")) {
                var tutName = getValByTag(tutorials[t], "name");
                tutsHTML += "<div class=tutorial name='" + tutName + "'><img class=tutorialImg src='" +
                  window.schoolLoc + "/tutorials/" + tutName + "/icons/icon.png'" +
                  " ></img></div>";
                totTuts++;
            }
        }
        $("#tutorialSchoolElem img").css({"left": "0%", "top": "0%", "transform": "translateY(0%) translateX(0%)"});
        var maxWidth = Math.max(totTuts * 95, 1244);
        $("#tutorialSchoolElem").find("#tutorials").css({"width": maxWidth, "padding": 10, "border-width": 3});
        $("#tutorialSchoolElem").find("#tutorials").find("#slider").html(tutsHTML);
        $("#tutorialSchoolElem #cover").css("width", "100%");
        // Click events now handed in mouse events, integrated with slider thing stuff
        if (device.platform == "browser") {
            // $(".tutorial").on("click", gotoTutorial);
        } else {
            // $(".tutorial").on("touchend", gotoTutorial);
        }
        // $("#avatar").css("opacity", 0.1);
        $("#avatar").css("pointer-events", "none");
    }
    function closeTutorial() {
        $("#tutorialSchoolElem img").css({"left": "50%", "top": "50%", "transform": "translateY(-50%) translateX(-50%)"});
        // $("#tutorialSchoolElem").find("#tutorials").css({"width": 0, "padding": 0, "border-width": 0});
        $("#tutorialSchoolElem #cover").css("width", "0%");
        // $("#avatar").css("opacity", 1);
        $("#avatar").css("pointer-events", "auto");
    }
    function toggleTutorial() {
        if (window.tutorialOpen) {
            window.tutorialOpen = false;
            closeTutorial();
        } else {
            window.tutorialOpen = true;
            openTutorial();
        }
    }
    if (device.platform == "browser") {
        //$("#tutorialSchoolElem").on("click", goTutorial);
        $("#openTuts").on("click", toggleTutorial);
        $("#goBooks").on("click", function() {
            window.location.href = "books.html";
        });
    } else {
        //$("#tutorialSchoolElem").on("touchend", goTutorial);
        $("#openTuts").on("touchend", toggleTutorial);
        $("#goBooks").on("touchend", function() {
            window.location.href = "books.html";
        });
    }

    function goScrapbook() {
    }
    if (device.platform == "browser") {
        $("#scrapbookSchoolElem").on("click", goScrapbook);
    } else {
        $("#scrapbookSchoolElem").on("touchend", goScrapbook);
    }
    attachMouseEvents();
}, false);
function gotoTutorial() {
    var tutName = $(this).attr("name");
    var loc = window.schoolLoc + "/tutorials/" + tutName + "/index.html"
    var serverLoc = window.schoolName + "_zip/" + tutName + "_Tutorial.zip";
    checkDownloadAndGo(loc, serverLoc);
}

function gotoSubject(elem) {
    var sub = $(elem).attr("subject");
    var iconDown = $(elem).attr("iconDown");
    if (iconDown == "false") {
        iconDown = false;
    }
    var img = $(elem).find("img");
    if (sub) {
        if (iconDown) {
            var oldSrc = $(img).attr("src");
            $(img).attr("src", window.schoolLoc + "/" + sub + "/icons/" + iconDown);
        } else {
            $(img).css({"max-height": "90%", "max-width": "90%"});
        }
        window.setTimeout(function () {
            if (iconDown) {
                $(img).attr("src", oldSrc);
            } else {
                $(img).css({"max-height": "100%", "max-width": "100%"});
            }
            window.location.href = "subject.html?" + sub;
        }, 100);
    }
}
function retakePicture() {
    var cam = new QuickCamera();
    deleteFile("users/" + window.userID + "/profile_pic", function () {
        cam.snap("users/" + window.userID, "profile_pic", function (url) {
            window.setTimeout(function () {
                window.location.href = window.location.href;
            }, 1000); // used to be 5000
        });
    })
}

function getValByTag(node, tag) {
    if (node && node.getElementsByTagName(tag).length && node.getElementsByTagName(tag)[0].innerHTML) {
        return node.getElementsByTagName(tag)[0].innerHTML;
    } else {
        return false;
    }
}

function attachMouseEvents() {

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

    window.mouseEvent = new MouseEvent(152);
    $("#slider").on(downEvt, window.mouseEvent.down);
    $("#slider").on(upEvt, window.mouseEvent.up);
    $("#slider").on(outEvt, window.mouseEvent.up);
    $("#slider").on(moveEvt, window.mouseEvent.move);
}


function MouseEvent(itemSize) {
    var THIS = this;
    this.itemSize = itemSize;
    this.orig = false;
    this.latestLoc = false;
    this.mDown = false;
    this.windowWidth = $("#tutorials").width();
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
        // THIS.overflow = -1 * (THIS.scrollWidth - THIS.windowWidth);
        THIS.overflow = ($(this).find(".tutorial").length * THIS.itemSize * -1) + $("#tutorials").width();
        THIS.dragTimeOffsetMet = window.setTimeout(function () {
            window.clearTimeout(THIS.dragTimeOffsetMet);
            THIS.dragTimeOffsetMet = false;
        }, 200);
    }
    this.up = function (e) {
        // Only needed for browser development;
        // if (e.type !== "mouseout" || e.target.classList[0] !== "tutorial") {
        if (true) {
            THIS.mDown = false;
            var clickedUnit = false;
            var curX = THIS.latestLoc;
            var curLeft = $(this).attr("left");
            if (curX && !THIS.hasMoved) {
                if (Math.abs(curX - (THIS.orig + parseFloat(curLeft))) < THIS.itemSize / 4 && THIS.dragTimeOffsetMet) {
                    var marginOffset = 18;
                    var unitNum = Math.abs(Math.floor((curLeft - curX + marginOffset) / THIS.itemSize)) - 1;
                    clickedUnit = $(this)[0].getElementsByClassName("tutorial")[unitNum];
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
                gotoTutorial.call(clickedUnit);
            }
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
