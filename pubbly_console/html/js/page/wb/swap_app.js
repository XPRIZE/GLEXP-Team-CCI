$(document).ready(function () {
    $.ajax({
        url: "ajax/get/getSeriesObject.php",
        data: { "seriesName": seriesName },
        success: function (data) {
            var newData = false;
            try {
                newData = jQuery.parseJSON(data);
            } catch (e) {
                document.body.innerHTML = data;
            }

            if (newData.children.length == 0) {
                for (var p = 0; p < newData.parent.pages.length; p++) {
                    createPage(newData.parent.name, p + 1, true);
                    for (var a = 0; a < newData.parent.pages[p].length; a++) {
                        var asset = newData.parent.pages[p][a];
                        createRow(newData.parent.name.name, p + 1, asset, true, a);
                    }
                }
                delete elem.cols[0].width;

                var tab = {};
                tab.view = "tabview";
                tab.cells = [];
                tab.cells.push({
                    header: "No children",
                    rows: [
                        { height: 10, },
                        {
                            cols: [
                                {
                                    view: "button", value: "New", inputWidth: 150, align: 'center', on: {
                                        onItemClick: function () {
                                            var name = window.prompt("Enter a child book name.");
                                            if (name) {
                                                createChild(name);
                                            }
                                        }
                                    }
                                },
                            ]
                        },
                        { height: 10, },
                    ]
                });


                elem.cols[0].gravity = 1;
                elem.cols[2] = tab;
                var final = finalPrep(elem);
                webix.ui(final);
            } else {
                ready(newData);
            }

        }
    });

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) {
                return pair[1];
            }
        }
        return (false);
    }

    var gotoChild = getQueryVariable('g');
    if (gotoChild) {
        gotoChild = atob(gotoChild);
    }

    window.assetsUsed = {};
    window.pagesInChildBooks = {};

    createAudioPlayer = function () {
        window.audioPlayers = [];
        for (let i = 0; i < 3; i++) {
            window.audioPlayers.push(document.createElement("audio"));
            window.audioPlayers[i].setAttribute("hidden", "true");
            document.body.appendChild(window.audioPlayers[i]);
            window.audioPlayers[i].onerror = function (e, msg) {
                console.log(msg);
            }
        }
        /*
         * 
         *  if (audioPlayer.extTried.length >= 3) {
         var src = decodeURI(e.srcElement.src.split("/").pop());
         webix.message('Error: Audio file "' + src + '" is missing or corrupted');
         } else {
         if (audioPlayer.extTried.length == 1) {
         audioPlayer.src = audioPlayer.root + ".wav?" + Math.random();
         ;
         audioPlayer.extTried.push(".wav");
         audioPlayer.play();
         } else {
         audioPlayer.src = audioPlayer.root + ".ogg?" + Math.random();
         ;
         audioPlayer.extTried.push(".ogg");
         audioPlayer.play();
         }
         }
         */

    }();
    function playAud(src) {
        let exts = ["wav", "mp3", "ogg"];
        for (let i = 0; i < exts.length; i++) {
            let ext = exts[i];
            window.audioPlayers[i].src = "series/" + window.seriesName + "/audio/" + src + "." + ext + "?" + Math.random();;
            window.audioPlayers[i].play();
        }

    }
    function setNoteAjax(series, child, page, assetSrc, type, val) {
        var dataObj = {};
        dataObj.series = series;
        dataObj.child = child;
        dataObj.page = page;
        dataObj.assetSrc = assetSrc;
        dataObj.type = type;
        dataObj.val = val;
        $.ajax({
            url: "ajax/set/setNote.php",
            data: dataObj,
            success: function (data) {
                webix.message(initCaps(type) + " saved");
            }
        });
    }
    function setSizeOrLocAjax(series, child, page, assetSrc, val) {
        var dataObj = {};
        dataObj.series = series;
        dataObj.child = child;
        dataObj.page = page;
        dataObj.assetSrc = assetSrc;
        dataObj.val = val;
        $.ajax({
            url: "ajax/set/setSizeOrLoc.php",
            data: dataObj,
            success: function (data) {
                webix.message(initCaps(val) + " saved");
            }
        });
    }
    function setTextAlignment(series, child, page, assetSrc, val) {
        var dataObj = {};
        dataObj.series = series;
        dataObj.child = child;
        dataObj.page = page;
        dataObj.assetSrc = assetSrc;
        dataObj.val = val;
        $.ajax({
            url: "ajax/set/setTextAlignment.php",
            data: dataObj,
            success: function (data) {
                webix.message(initCaps(val) + " saved");
            }
        });
    }


    var header = {
        view: "toolbar",
        height: 55,
        autoWidth: true,
        cols: [
            {
                view: "button", value: "Home", width: 80, on: {
                    onItemClick: function () {
                        window.location.href = "index.php";
                    }
                }
            },
            {
                view: "button", value: "Series Select", width: 80, on: {
                    onItemClick: function () {
                        window.location.href = "variable_exports.php";
                    }
                }
            },
            {
                view: "label",
                template: "<p class='toolbarCenterLabel'>Swap App</p>"
            },
            { width: 80, },
            {
                view: "button", value: "Logout", width: 80, on: {
                    onItemClick: function () {
                        window.location.href = "logout.php";
                    }
                }
            }
        ]
    };

    var hr = {
        type: "space",
        height: 5,
        template: "<hr>",
    };

    var elem = {
        id: "chooseProject",
        type: "line",
        css: "main",
        cols: [
            {
                borderless: true,
                view: "tabview",
                autoheight: true,
                width: 200,
                css: "parentTabMainCon",

                cells: [
                    {
                        header: "Parent",
                        body: {
                            rows: [
                                { height: 5, },
                                {
                                    cols: [
                                        { width: 10, },
                                        {
                                            view: "toolbar",
                                            css: "ParentChildToolbar",
                                            border: 2,
                                            cols: [
                                                { width: 10, },
                                                {
                                                    view: "button",
                                                    value: "Download parent",
                                                    width: 150,
                                                    align: "center",
                                                    on: {
                                                        onItemClick: function () {
                                                            window.location.href = "Parent.zip";
                                                        }
                                                    },
                                                },
                                                { width: 10, },
                                            ],
                                        },
                                        { width: 10, },
                                    ]
                                },
                                { height: 5, },
                                { height: 30, template: "<p style='text-align:center'>" + seriesName + "</p>" },
                                { height: 5, },
                            ]
                        }
                    }
                ]
            },
            {
                view: "resizer"
            }
            ,
            {
                borderless: true,
                view: "tabview",
                tabbar: {
                    tabOffset: 10,
                },
                id: "childTabMainCon",
                css: "childTabMainCon",
                autoheight: true,
                cells: [],
            },
        ]
    };

    // ABSOLUTELY NEED THIS, can't figure out how to stick it in the original elem declaration.
    // Keys for parent
    elem.cols[0].cells[0].body.keys = {};
    // Keys for children
    elem.cols[2].cells.key = {};




    window.forceStyle = function (sel, prop, val) {
        // Why? Webix hot swaps html, so anything in the html itself gets erased. Style sheets don't get touched though.
        var css = sel + " { " + prop + ": " + val + "; }";
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');

        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style);
    };

    function createTab(childObj) {
        var childName = childObj.name;
        var locked = childObj.locked;
        var status = childObj.status || "progress";
        status = initCaps(status);
        var lockUnlockButtonValue = "Lock";
        if (locked) {
            lockUnlockButtonValue = "Unlock";
        }
        var colorKey = {
            "locked": "#000000",
            "progress": "#0028ff",
            "complete": "#02ff00",
            "missing": "#b90101",
        };
        var curColor = colorKey[status.toLowerCase()];
        // easy manipulation in phpstorm.
        var _locked = "<span style='color:#000000'></span>";
        var _progress = "<span style='color:#0028FF'></span>";
        var _complete = "<span style='color:#02FF00'></span>";
        var _missing = "<span style='color:#B90101'></span>";

        var tab = {};
        tab.body = {};
        tab.body.rows = [];
        tab.body.rows.push({
            rows: [
                { height: 5, },
                {
                    cols: [
                        { width: 10 },
                        {
                            view: "toolbar",
                            css: "ParentChildToolbar",
                            cols: [
                                {
                                    view: "button", value: "View", width: 80, on: {
                                        onItemClick: function () {
                                            let sn = btoa(window.seriesName);
                                            let cn = btoa(childName);
                                            let url = "read.php?t=c&sn=" + sn + "&cn=" + cn;
                                            url += "&engineCode=new";
                                            var win = window.open(url, '_blank');
                                            if (audioPlayer) {
                                                audioPlayer.pause();
                                            }
                                            win.focus();
                                        }
                                    }
                                },
                                {},
                                {
                                    view: "button", value: "Delete", width: 80, css: "delete", on: {
                                        onItemClick: function () {
                                            var url = "ajax/delete/deleteChild.php?seriesName=" + seriesName + "&childName=" + childName;
                                            deletePrompt(childName, "child", url, false);
                                        }
                                    }
                                },
                                {},
                                {
                                    view: "button", value: lockUnlockButtonValue, width: 80, on: {
                                        onItemClick: function () {
                                            var action;
                                            var THIS = this;
                                            if ($$(this).getValue() == "Lock") {
                                                action = true;
                                            } else {
                                                action = false;
                                            }
                                            $.ajax("ajax/misc/lockChild.php?seriesName=" + seriesName + "&childName=" + childName + "&action=" + action).done(
                                                function (ret) {
                                                    // returning done\r... so fuck it.
                                                    if (ret == "done" || true) {
                                                        if (action) {
                                                            $$(THIS).setValue("Unlock");
                                                            $$(THIS).refresh();
                                                            for (var p = 0; p < window.pagesInChildBooks[childName].length; p++) {
                                                                var curPage = window.pagesInChildBooks[childName][p];
                                                                $$(childName + "_page_" + curPage).disable();
                                                            }
                                                        } else {
                                                            $$(THIS).setValue("Lock");
                                                            $$(THIS).refresh();
                                                            for (var p = 0; p < window.pagesInChildBooks[childName].length; p++) {
                                                                var curPage = window.pagesInChildBooks[childName][p];
                                                                $$(childName + "_page_" + curPage).enable();
                                                            }
                                                        }

                                                        // window.location.href = window.location.href;
                                                    } else {
                                                        document.body.innerHTML = ret;
                                                    }
                                                }
                                            );
                                        }
                                    }
                                },
                                {},
                                {
                                    view: "select", value: status, width: 140, options: [
                                        "Progress",
                                        "Complete",
                                        "Missing",
                                    ],
                                    on: {
                                        onChange: function () {
                                            var action = $$(this).getValue().toLowerCase();
                                            $.ajax("ajax/set/setChildStatus.php?seriesName=" + seriesName + "&childName=" + childName + "&action=" + action).done(
                                                function (ret) {
                                                    if (ret == "done" || true) {
                                                        forceStyle("#c_" + childName + "_status .statuses", "display", "none");
                                                        forceStyle("#c_" + childName + "_status ." + action, "display", "initial");
                                                        webix.message("Status changed.");
                                                    } else {
                                                        document.body.innerHTML = ret;
                                                    }
                                                }
                                            );
                                        }
                                    }
                                },
                                {},
                                {
                                    view: "button", value: "New", width: 80, on: {
                                        onItemClick: function () {
                                            var name = window.prompt("Enter a child book name.");
                                            if (name) {
                                                createChild(name);
                                            }
                                        }
                                    }
                                },
                            ]
                        },
                        { width: 10 },
                    ]
                },
                { height: 5, },
                { height: 30, template: "<p style='text-align:center'>" + childName + "</p>" },
                { height: 5, },
            ]
        });
        tab.body.keys = {};
        var lockedClass = "";
        if (locked) {
            lockedClass = "locked";
        }

        tab.header = "" +
            "<div class='childHeaders " + lockedClass + "'>" +
            "<b>" +
            "<div id='c_" + childName + "_status' style='display: inline-block;width:100%;'>" +
            "<p style='padding-top:7px'>" +
            // Why? Webix hot swaps html, so anything in the html itself gets erased. Keep all statuses as seperate elements, redeclare style sheets to show and hide each.
            '<span class="statuses progress">&#x21BB;</span>' +
            '<span class="statuses complete">&#x2714;</span>' +
            '<span class="statuses missing">&#x2716;</span>' +
            '<span class="childName" style="color:black;">' +
            childName +
            "</span>" +
            "</p> " +
            "</div>" +
            "</b>" +
            "</div>" +
            "";
        forceStyle("#c_" + childName + "_status ." + status, "display", "initial");
        /*
         tab.header.labelWidth = 500;
         tab.header.inputWidth = 500;
         tab.header.labelWidth = 500;
         tab.header.minWidth = 500;
         tab.header.optionWidth = 500;
         tab.header.tabMinWidth = 500;
         */
        elem.cols[2].cells.key[childName] = elem.cols[2].cells.length;
        elem.cols[2].cells.push(tab);
    }

    function createPage(childObj, pageNumber, isParent) {
        var bookName = childObj.name;
        var locked = childObj.locked;
        var tab;
        if (isParent) {
            tab = elem.cols[0].cells[0];
        } else {
            var loc = elem.cols[2].cells.key[bookName];
            tab = elem.cols[2].cells[loc];
        }
        var header = {};
        header.template = "Page " + pageNumber;
        header.type = "header";
        tab.body.id = bookName + "_tab";
        tab.body.keys[pageNumber] = tab.body.rows.length + 1;
        tab.body.rows.push(header);
        var pagesID = "";
        if (isParent) {
            pagesID = "parent_page_" + pageNumber;
        } else {
            pagesID = bookName + "_page_" + pageNumber;
            if (!window.pagesInChildBooks[bookName]) {
                window.pagesInChildBooks[bookName] = [];
            }
            window.pagesInChildBooks[bookName].push(pageNumber);
        }
        tab.body.rows.push({ id: pagesID, disabled: locked, "rows": [] });
    }

    function createRow(bookName, pageNumber, asset, isParent, assetNum) {
        var assetSrc = asset.newAsset;
        var assetType = asset.type;
        var originalAssetName = asset.originalAsset;
        if (assetType == "field") {
            originalAssetName = asset.fieldName;
        }
        var curPlaceholder = asset.placeholder;
        var curNotes = asset.note;

        var bookLoc, pageLoc, pageAct;
        if (isParent) {
            pageLoc = elem.cols[0].cells[0].body.keys[pageNumber];
            pageAct = elem.cols[0].cells[0].body.rows[pageLoc].rows;
        } else {
            bookLoc = elem.cols[2].cells.key[bookName];
            pageLoc = elem.cols[2].cells[bookLoc].body.keys[pageNumber];
            pageAct = elem.cols[2].cells[bookLoc].body.rows[pageLoc].rows;
        }

        if (!bookName) {
            bookName = "parent";
        }
        var rootID = "book_" + bookName + "_page_" + pageNumber + "_src_" + originalAssetName;

        if (window.assetsUsed[rootID]) {
            // Don't create row, it's a dup.
            return false;
        } else {
            window.assetsUsed[rootID] = 1;
            var btn = {};
            var preview = {};
            var placeholder = {};
            var note = {};
            var dropzone = {};
            var toggle = {};

            if (true) {
                btn.height = 100;
                btn.disabled = isParent || (assetType == "field"); // Parent buttons disabled, fields disabled
                btn.gravity = 1;
                btn.id = rootID + "_btn";
                btn.view = "button";
                if (assetType == "field") {
                    btn.value = asset.fieldName;
                } else {
                    btn.value = assetSrc;
                }
                if (!isParent) {
                    if (assetType !== "field") {
                        btn.value = "Download";
                        btn.on = {};
                        btn.on.onItemClick = function () {
                            if (assetType == "audio") {
                                $.ajax({
                                    url: assetType + "/" + assetSrc + ".wav",
                                    type: 'HEAD',
                                    error: function () {
                                        $.ajax({
                                            url: assetType + "/" + assetSrc + ".mp3",
                                            type: 'HEAD',
                                            error: function () {
                                                webix.message("Error: Can't find file on server");
                                            },
                                            success: function () {
                                                downloadFile(assetType + "/" + assetSrc + ".mp3");
                                            }
                                        });
                                    },
                                    success: function () {
                                        downloadFile(assetType + "/" + assetSrc + ".wav");
                                    }
                                });
                            } else {
                                $.ajax({
                                    url: "series/" + seriesName + "/images/" + assetSrc,
                                    type: 'HEAD',
                                    error: function () {
                                        webix.message("Error: Can't find " + assetType + "/" + assetSrc + " on server");
                                    },
                                    success: function () {
                                        downloadFile("series/" + seriesName + "/images/" + assetSrc);
                                    }
                                });
                            }

                            function downloadFile(fullSrc) {
                                var a = $("<a>")
                                    .attr("href", fullSrc)
                                    .attr("download", fullSrc)
                                    .appendTo("body");
                                a[0].click();
                                a.remove();
                            }

                        }
                    }
                }

                placeholder.id = rootID + "_placeholder";
                placeholder.value = curPlaceholder;
                if (!curPlaceholder) {
                    placeholder.placeholder = "Placeholder";
                }
                placeholder.css = "assetPlaceholder";
                placeholder.view = "textarea"; // Use double quotes for textareas ONLY.
                placeholder.gravity = 1;
                placeholder.on = {};
                placeholder.on.onBlur = function () {
                    setNoteAjax(seriesName, bookName, pageNumber, originalAssetName, "placeholder", $$(this).getValue());
                    $$() // what's this?
                };
                placeholder.on.onKeyPress = function (e) {
                    if (e == 13) {
                        $$(this).blur();
                        setNoteAjax(seriesName, bookName, pageNumber, originalAssetName, "placeholder", $$(this).getValue());
                    }
                };


                note.id = rootID + "_note";
                note.value = curNotes;
                if (!curNotes) {
                    note.placeholder = "Note";
                }
                note.css = "assetNote";
                note.view = "textarea";
                note.gravity = 1;
                note.on = {};
                note.on.onBlur = function () {
                    setNoteAjax(seriesName, bookName, pageNumber, originalAssetName, "note", $$(this).getValue());
                };
                note.on.onKeyPress = function (e) {
                    if (e == 13) {
                        $$(this).blur();
                        setNoteAjax(seriesName, bookName, pageNumber, originalAssetName, "note", $$(this).getValue());
                    }
                };


                dropzone.gravity = 2;
                dropzone.id = rootID + "_lnk";
                dropzone.minWidth = 260;
                dropzone.scroll = false;
                dropzone.type = "uploader";
                dropzone.view = "list";
            }

            if (assetType == "image" || assetType == "video") {
                preview.data = [];
                preview.data.push({});
                preview.data[0] = {};
                if (assetType == "image") {
                    preview.data[0].img = "" +
                        "<div class='imageCont'>" +
                        "<span class='helper'></span>" +
                        "<img src='series/" + seriesName + "/images/" + assetSrc + "' class='preview' />" +
                        "</div>";
                } else if (assetType == "video") {
                    preview.data[0].img = "" +
                        "<div class='imageCont'>" +
                        "<span class='helper'></span>" +
                        "<video src='series/" + seriesName + "/videos/" + assetSrc + "' class='preview' controls>" +
                        "</video>" +
                        "</div>";
                }


                preview.gravity = 1;
                preview.id = rootID + "_img";
                preview.scroll = false;
                preview.select = false;
                preview.template = "#img#";
                preview.type = {};
                preview.type.height = 100;
                preview.view = "list";

                toggle.width = 50;
                toggle.view = "button";
                var display = "size";
                if (asset.sizeOrLoc == "loc") {
                    display = "loc";
                }
                toggle.value = display;
                toggle.on = {};
                toggle.on.onItemClick = function () {
                    if ($$(this).getValue() == "size") {
                        $$(this).setValue("loc");
                    } else {
                        $$(this).setValue("size");
                    }
                    setSizeOrLocAjax(seriesName, bookName, pageNumber, originalAssetName, $$(this).getValue());
                    $$(this).refresh();
                }
            } else if (assetType == "audio") {
                preview.disabled = false;
                preview.gravity = 1;
                preview.id = rootID + "_aud";
                if (asset.fileModified) {
                    preview.css = "modified";
                }
                preview.value = assetSrc;
                preview.view = "button";
                preview.on = {};
                preview.on.onItemClick = function () {
                    playAud($$(this).getValue());
                };

                toggle.rows = [];
                toggle.rows[0] = {};
                toggle.rows[0].view = "button";
                toggle.rows[0].width = 50;
                toggle.rows[0].height = 50;
                toggle.rows[0].value = "+";
                toggle.rows[0].on = {};
                toggle.rows[0].on.onItemClick = function (id, e) {
                    var THIS = this;
                    if (asset.originalAsset == asset.newAsset) {
                        webix.message("Only swapped audio files can be modified.");
                    } else {
                        $$(this).disable();
                        modAudio(assetSrc, bookName, "1.2", function (ret) {
                            $($$(rootID + "_aud").$view).addClass("modified")
                            $$(THIS).enable();
                            playAud(assetSrc);
                        });
                    }
                };
                toggle.rows[1] = {};
                toggle.rows[2] = {};
                toggle.rows[2].view = "button";
                toggle.rows[2].width = 50;
                toggle.rows[2].height = 50;
                toggle.rows[2].value = "-";
                toggle.rows[2].on = {};
                toggle.rows[2].on.onItemClick = function () {
                    var THIS = this;
                    if (asset.originalAsset == asset.newAsset) {
                        webix.message("Only swapped audio files can be modified.");
                    } else {
                        $$(this).disable();
                        modAudio(assetSrc, bookName, "0.8", function (ret) {
                            $($$(rootID + "_aud").$view).addClass("modified")
                            $$(THIS).enable();
                            playAud(assetSrc);
                        });
                    }
                };

            } else if (assetType == "field") {
                if (isParent) {
                    preview.view = "textarea";
                    preview.value = atob(assetSrc);
                } else {
                    btn.gravity = 2;
                    preview = false;

                    dropzone = {};
                    dropzone.view = "textarea";
                    dropzone.css = "align-" + asset.textAlign;
                    dropzone.value = atob(assetSrc);
                    dropzone.gravity = 2;
                    dropzone.minWidth = 260;
                    dropzone.id = rootID + "_textarea";
                    dropzone.on = {};
                    // var fieldID = "book_" + bookName + "_page_" + pageNumber + "_src_" + asset.fieldName;
                    dropzone.on.onBlur = function () {
                        updateField(seriesName, bookName, asset.fieldName, $$(this).getValue());
                    };
                    dropzone.on.onKeyPress = function (e) {
                        // Shift return gives return in field itself. Regular return closes and saves field.
                        var shiftDown = window.event.shiftKey ? true : false;
                        if (e == 13 && !shiftDown) {
                            $$(this).blur();
                            updateField(seriesName, bookName, asset.fieldName, $$(this).getValue());
                        }
                    };
                }

                toggle.width = 50;
                toggle.view = "button";
                toggle.value = asset.textAlign;
                toggle.on = {};
                toggle.on.onItemClick = function () {
                    var dirloop = ["left", "center", "right"];
                    var cur = dirloop.indexOf($$(this).getValue());
                    cur++;
                    if (cur >= dirloop.length) {
                        cur = 0;
                    }
                    $$(this).setValue(dirloop[cur]);
                    console.log(dirloop[cur]);
                    setTextAlignment(seriesName, bookName, pageNumber, originalAssetName, dirloop[cur]);
                    $($$(rootID + "_textarea").$view).removeClass("align-left");
                    $($$(rootID + "_textarea").$view).removeClass("align-center");
                    $($$(rootID + "_textarea").$view).removeClass("align-right");
                    $$(rootID + "_textarea").define("css", "align-" + dirloop[cur]);
                    $$(this).refresh();
                    $$(rootID + "_textarea").refresh();
                }
            } else if (assetType == "video") {
                console.log("here");
            }

            var rowNum = {};
            rowNum.template = "<h2 class=rowNum>" + (assetNum + 1) + "</h2>";
            rowNum.width = 55;
            rowNum.height = 90; // when 100 the right col is offsetting the left... dunno man.

            var row = {};
            row.cols = [];
            row.cols.push(btn);
            if (preview) {
                row.cols.push(preview);
            }
            if (!isParent) {
                row.cols.push(placeholder);
                row.cols.push(note);
                row.cols.push(dropzone);
                row.cols.push(toggle);
                row.cols.push(rowNum);
            }

            pageAct.push(row);

            return rootID;
        }
    }

    function createDropZone(childName, pageNum, assetSrc, assetType, sizeOrLoc, originalAssetName, elemID) {
        // var elemID = "book_" + childName + "_page_" + pageNum + "_src_" + originalAssetName;
        var uploadScriptSrc = "ajax/upload/uploadNewAsset.php?" +
            "seriesName=" + window.seriesName +
            "&assetType=" + assetType +
            "&childName=" + childName +
            "&originalAssetName=" + originalAssetName +
            "&assetSwapSizeOrLoc=" + sizeOrLoc;
        webix.ui({
            id: elemID + "_dz",
            view: "uploader",
            upload: uploadScriptSrc,
            on: {
                onAfterFileAdd: function (item) {
                    // Used to be a convention check, susan complained, I don't care anymore.
                    /*
                     var conventionCheck = item.file.name.split("_");
                     if (
                     (conventionCheck.length > 1) &&
                     (conventionCheck[0].charAt(0) == "P" || conventionCheck[0].charAt(0) == "C") &&
                     (!isNaN(Number(conventionCheck[0].charAt(1))))
                     ) {
                     // $$(this).stopUpload();
                     var oldSrc = $$(this).data.upload;
                     // Interrupt upload
                     $$(this).data.upload = false;
                     window.setTimeout(function () {
                     // Reset upload while still allowing for webix to catch the event and not go to desktop/apple.png
                     $$(elemID + "_dz").data.upload = oldSrc;
                     }, 1);
                     
                     if (window.confirm("The prefix 'P_' or 'C1_' cannot be used. Please rename your asset and reupload")) {
                     window.setTimeout(function () {
                     $$(elemID + "_dz").setValue();
                     $$(elemID + "_dz").refresh();
                     }, 1);
                     } else {
                     window.setTimeout(function () {
                     $$(elemID + "_dz").setValue();
                     $$(elemID + "_dz").refresh();
                     }, 1);
                     }
                     } else {
                     }
                     */
                    if (item.type == "gif") {
                        // webix.message("Unpacking gif, please wait");
                    }
                },
                onFileUploadError: function (item) {
                    console.log(item.xhr.response);
                    // Testing really, just to see the php error in html.
                    document.body.innerHTML = item.xhr.response;
                },
                onFileUpload: function (item) {
                    var THIS = this;
                    if ($$(elemID + "_img")) {
                        var img = $$(elemID + "_img").$view.getElementsByClassName("preview")[0];
                        img.setAttribute("src", 'assets/assetWait.png');
                        var src = "series/" + window.seriesName + "/" + item.src;
                        console.log(src);
                        window.setTimeout(function () {
                            img.setAttribute("src", src);
                        }, 250);
                    } else {
                        var loc = item.src.split("/");
                        var name = loc.pop();
                        var audName = name.split(".");
                        audName.pop();
                        audName.join(".");
                        console.log(audName);
                        $$(elemID + "_aud").setValue(audName);
                        $$(elemID + "_aud").refresh();
                    }
                    // Getting a weird error if I update directly from here... webix's fault, not my prob.
                    window.setTimeout(function () {
                        $$(elemID + "_dz").setValue({ name: "Upload Complete!", sizetext: "", status: "" });
                        $$(elemID + "_dz").refresh();
                        var filename = item.src.split("/");
                        filename.shift();
                        filename.join("/");
                        $$(elemID + "_btn").setValue(filename);
                        $$(elemID + "_btn").refresh();
                    }, 1);
                    this.timeout = window.setTimeout(function () {
                        THIS.setValue();
                        THIS.refresh();
                    }, 1000);
                },
                onBeforeFileAdd: function (item) {
                }
            },
            link: elemID + "_lnk",
            apiOnly: true,
        });
        $$(elemID + "_dz").addDropZone($$(elemID + "_lnk").$view, "Drop files here");
    }

    function createChild(name) {
        $.ajax({
            type: 'get',
            url: 'ajax/new/newChild.php?seriesName=' + seriesName + '&childName=' + name + '',
            success: function (ret) {
                if (ret == "done") {
                    window.location.href = "swap_app.php?series_name=" + btoa(seriesName) + "&g=" + btoa(name);
                } else {
                    document.body.innerHTML = ret;
                }
            }
        });
    }

    function initCaps(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function updateField(seriesName, bookName, fieldName, newContent) {
        var uploadScriptSrc = "ajax/upload/uploadNewAsset.php?" +
            "seriesName=" + seriesName +
            "&assetType=" + "field" +
            "&childName=" + bookName +
            "&originalAssetName=" + fieldName +
            "&newContent=" + btoa(newContent);
        $.ajax({
            type: 'get',
            url: uploadScriptSrc,
            success: function (ret) {
                if (ret == "done") {
                    webix.message('Field updated');
                } else {
                    document.body.innerHTML = ret;
                }
            }
        })
    }

    function modAudio(src, childName, action, callback) {
        var modAudUrl = "ajax/misc/modAudVol.php?" +
            "seriesName=" + window.seriesName +
            "&childName=" + childName +
            "&action=" + action +
            "&audName=" + src;

        $.ajax({
            url: modAudUrl, success: function (ret) {
                callback(ret);
            }
        })
    }


    function ready(data) {
        var dropZonesToCreate = [];
        // Parent
        for (var p = 0; p < data.parent.pages.length; p++) {
            createPage(data.parent.name, p + 1, true);
            for (var a = 0; a < data.parent.pages[p].length; a++) {
                var asset = data.parent.pages[p][a];
                createRow(data.parent.name.name, p + 1, asset, true, a);
            }
        }

        // Children
        for (var i = 0; i < data.children.length; i++) {
            var child = data.children[i];
            createTab(child);
            for (var p = 0; p < child.pages.length; p++) {
                var page = child.pages[p];
                createPage(child, p + 1);
                for (var a = 0; a < page.length; a++) {
                    var asset = page[a];
                    var elemID = createRow(child.name, p + 1, asset, false, a);
                    if (elemID && asset.type !== "field") {
                        dropZonesToCreate.push([child.name, p + 1, asset.newAsset, asset.type, asset.sizeOrLoc, asset.originalAsset, elemID]);
                    }
                }
            }
        }
        webix.ui({
            view: "scrollview",
            body: {
                type: "space",
                rows: [
                    header,
                    hr,
                    elem
                ]
            }
        });
        for (var d = 0; d < dropZonesToCreate.length; d++) {
            var cur = dropZonesToCreate[d];
            createDropZone.apply(this, cur);
        }
        if (gotoChild) {
            $$("childTabMainCon").setValue(gotoChild + "_tab");
        }
    }
});