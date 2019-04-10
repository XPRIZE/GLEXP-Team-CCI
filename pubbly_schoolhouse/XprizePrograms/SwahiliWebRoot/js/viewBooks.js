document.addEventListener("deviceready", function () {
    if (typeof Analytics !== "undefined") {
        window.AnalyticHandler = new Analytics();
    }

    ready();
});
// Tester
/*
 window.setTimeout(function () {
 ready();
 }, 1);
 */
function ready() {
    viewportFix();
    login(function (userID, schoolXML) {
        schoolXML = $.parseXML(schoolXML);
        window.schoolXML = schoolXML;
        window.schoolName = getValByTag(schoolXML, "name");
        window.userID = userID;
        parseXml(schoolXML);
    });
    function parseXml(xml) {
        var xmlStr = new XMLSerializer().serializeToString(xml);
        var xml = $.parseXML(xmlStr);
        window.xml = xml;

        var bookRoot = xml.getElementsByTagName("Books")[0];
        var rabbitPic = getValByTag(bookRoot, "rabbitIcon");
        var rabbitTut = getValByTag(bookRoot, "rabbitLoc");
        var shelves = bookRoot.getElementsByTagName("level");
        var shelvesHTML = "<div id='leftFog'></div>" +
          "<div id='leftStop'></div>" +
          "<div id='rightFog'></div>" +
          "<div id='rightStop'></div>" +
          "<img id='rabbit' src='" + window.schoolLoc + "/icons/" + rabbitPic + "' loc='" + window.schoolLoc + "/tutorials/" + rabbitTut + "/index.html' />" +
          "<div class='spacer' ></div>" +
          "<div class='spacer' ></div>";
        for (var s = 0; s < shelves.length; s++) {
            var shelf = shelves[s];
            var shelfName = getValByTag(shelf, "name");
            shelvesHTML += "<div class='shelf'><div class='slider'>";
            var books = shelf.getElementsByTagName("unit");
            for (var b = 0; b < books.length; b++) {
                if (getValByTag(books[b], "icon")) {
                    var book = books[b];
                    var bookName = getValByTag(book, "name");
                    var bookIcon = getValByTag(book, "icon");
                    var bookLoc = window.schoolLoc + "/Books/" + shelfName + "/" + bookName;
                    var iconSrc = bookLoc + "/images/" + bookIcon;
                    shelvesHTML += "<div class='book' loc='" + bookLoc + "/index.html'><img src='" + iconSrc + "' ></img></div>";
                }
            }
            shelvesHTML += "</div></div>";
            shelvesHTML += "<div class=spacer></div>";
        }
        shelvesHTML += "<div class=spacer></div>";

        $("#main").html(shelvesHTML);

        window.setTimeout(function () {
            attachEvents();
        }, 400);

    }


    function attachEvents() {
        var downEvt = "touchstart";
        var moveEvt = "touchmove";
        var upEvt = "touchend";
        var clickEvt = "touchend"; // alts?
        var outEvt = "mouseout"; //???
        if (device.platform == "browser") {
            downEvt = "mousedown";
            moveEvt = "mousemove";
            upEvt = "mouseup";
            clickEvt = "click"; // alts?
            outEvt = "mouseout";
        }

        $("#main").addClass("loaded");
        $("#main").animate({"opacity": 1}, 1000, function () {
            console.log("done");
        })
        var mDown = false;
        var mStart = [false, false, false];

        var retX = function (e) {
            if (e.originalEvent.touches) {
                if (e.originalEvent.touches.length) {
                    return e.originalEvent.touches[0].pageX;
                } else {
                    return e.changedTouches[0].clientX;
                }
            } else {
                return e.pageX;
            }
        }
        var retY = function (e) {
            if (e.originalEvent.touches) {
                if (e.originalEvent.touches.length) {
                    return e.originalEvent.touches[0].pageY;
                } else {
                    return e.changedTouches[0].clientY;
                }
            } else {
                return e.pageY;
            }
        }

        $(".slider").each(function (i) {
            var width = 0;
            var last = false;
            $(this).find(".book").each(function (b) {
                last = this;
                width += $(this).width() + 25;
            });
            $(last).css({"margin-right": 0});
            width -= 25;
            $(this).css({"width": width + "px"});
        });
        var scrollMax = 1;
        var mainMax = 1;
        $(".shelf").each(function () {
            mainMax = Math.max($(this).find(".slider").width(), mainMax);
            scrollMax = Math.min($(this).width() - $(this).find(".slider").width() - 25, scrollMax);
        });
        $("#main").css("width", (mainMax + 300) + "px");

        $("#main").on(moveEvt, function (e) {
            if (mDown) {
                var ex = retX(e);
                var mod = ex - mStart[0];
                var speed = 2;
                mod *= speed;

                var lastMod = $("#main").attr("modLeft") || 0;
                mod += 1 * lastMod; // cast to num
                if (mod >= 0) {
                    $("#main").css({"left": 0});
                } else if (mod <= scrollMax) {
                    $("#main").css({"left": scrollMax});
                } else {
                    $("#main").css({"left": mod});
                }
                if (ex < 25 || ex > $(window).width() - 50) {
                    mouseUpFnc(e);
                    mDown = false;
                }
            }
        });
        $("#main").on(downEvt, function (e) {
            e.preventDefault();
            mDown = true;
            mStart[0] = retX(e);
            mStart[1] = retY(e);
            mStart[2] = Date.now();
        });
        $("#main").on(upEvt, function (e) {
            mouseUpFnc(e);
        });
        function mouseUpFnc(e) {
            if (mDown) {
                e.preventDefault();
                $("#main").attr("modLeft", $("#main").offset().left);
            }
        }
        $(".book").on(clickEvt, function (e) {
            e.preventDefault(); //?
            if (mStart[0]) {
                var timeDif = Date.now() - mStart[2];
                var locDif = [Math.abs(mStart[0] - retX(e)), Math.abs(mStart[1] - retY(e))];
                if (timeDif > 300 || (locDif[0] > 50 || locDif[1] > 50)) {
                    mStart = [false, false, false];
                } else {
                    window.location.href = $(this).attr("loc");
                }
            }
        });

        $("#rabbit").on(clickEvt, function (e) {
            var loc = $(this).attr("loc");
            if (loc) {
                window.location.href = loc;
            }
        })
    }

}
