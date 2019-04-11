function updateRename(cat, oldName, newName) {
    // var id = $$(cat + "Combo").getValue();
    var id = false;
    for (var key in $$(cat + "DropDown").data.pull) {
        var obj = $$(cat + "DropDown").data.pull[key];
        if (oldName == obj.value) {
            id = key;
        }
    }
    if (id) {
        $$(cat + "DropDown").data.pull[id].value = newName;
        $$(cat + "DropDown").refresh();
        $$(cat + "Combo").setValue(1);
        $$(cat + "Combo").refresh();
    }
    if ($$(cat + "List")) {
        for (var key in $$(cat + "List").data.pull) {
            if ($$(cat + "List").data.pull[key].name == oldName) {
                $$(cat + "List").data.pull[key].name = newName
            }
        }
        $$(cat + "List").refresh();
    }
}
function deselectCat(level) {
    console.log(level);
    if (level >= 1) {
        $$("unitCombo").setValue(1);
        $$("unitCombo").refresh();
        $$("unitList").unselectAll();
        $$("deleteUnit").disable();
        $$("deleteUnitAction").disable();
        $$("editUnitAction").disable();
        $$("saveUnitActionOld").disable();
        $$("saveUnitActionNew").disable();
        $$("downloadUnit").disable();
        window.selectedUnit = false;
    }
    if (level >= 2) {
        $$("levelCombo").setValue(1);
        $$("levelCombo").refresh();
        $$("deleteLevel").disable();
        $$("unitCombo").disable();
        $$("newUnit").disable();
        $$("selectPrompt").show();
        $$("newUnitAction").disable();
        $$("newGameAction").disable();
        // Delete old shit from list
        for (var i = $$("unitList").count() - 1; i >= 0; i--) {
            $$("unitList").remove($$("unitList").data.order[i])
        }
        window.selectedLevel = false;
    }
    if (level >= 3) {
        $$("subjectCombo").setValue(1);
        $$("subjectCombo").refresh();
        $$("deleteSubject").disable();
        $$("levelCombo").disable();
        $$("newLevel").disable();
        window.selectedSubject = false;
    }
    if (level >= 4) {
        $$("schoolCombo").setValue(1);
        $$("schoolCombo").refresh();
        $$("deleteSchool").disable();
        $$("subjectCombo").disable();
        $$("newSubject").disable();
        $$("viewTutorial").disable();
        $$("editTutorial").disable();
        $$("orderTutorials").disable();
        $$("deleteTutorial").disable();
        $$("newTutorial").disable();
        $$("downloadTutorial").disable();
        window.selectedSchool = false;
    }
}
function renameSchool(newName) {
    var oldName = window.selectedSchool;
    if (newName !== oldName && oldName !== "-- School --") {
        if (oldName) {
            if (noBadNameChars(newName)) {
                deselectCat(4);
                $.ajax("ajax/rename/renameSchool.php?oldName=" + oldName + "&newName=" + newName).done(
                        function (ret) {
                            updateRename("school", oldName, newName);
                            window.selectedSchool = newName;
                        }
                )
            } else {
                // bad chars sends error
            }
        } else {
            webix.message("Select a school to rename");
        }
    }
}
function renameSubject(newName) {
    var oldName = window.selectedSubject;
    if (newName !== oldName && oldName !== "-- Subject --") {
        if (oldName) {
            if (noBadNameChars(newName)) {
                deselectCat(3);
                $.ajax("ajax/rename/renameSubject.php?schoolName=" + window.selectedSchool + "&oldName=" + oldName + "&newName=" + newName).done(
                        function (ret) {
                            console.log(ret);
                            updateRename("subject", oldName, newName);
                            window.selectedSubject = newName;
                        }
                )
            } else {
                // bad chars sends error
            }
        } else {
            webix.message("Select a subject to rename");
        }
    }
}
function renameLevel(newName) {
    var oldName = window.selectedLevel;
    if (newName !== oldName && oldName !== "-- Level --") {
        if (oldName) {
            if (noBadNameChars(newName)) {
                deselectCat(2);
                $.ajax("ajax/rename/renameLevel.php?schoolName=" + window.selectedSchool + "&subjectName=" + window.selectedSubject + "&oldName=" + oldName + "&newName=" + newName).done(
                        function (ret) {
                            updateRename("level", oldName, newName);
                            window.selectedLevel = newName;
                        }
                )
            } else {
                // bad chars sends error
            }
        } else {
            webix.message("Select a level to rename");
        }
    }
}

function renameUnit(newName) {
    var oldName = window.selectedUnit;
    if (newName !== oldName && oldName !== "-- Unit --") {
        if (oldName !== "Tutorial" && !isGame(oldName)) {
            if (oldName) {
                if (noBadNameChars(newName)) {
                    deselectCat(1);
                    $.ajax("ajax/rename/renameUnit.php?schoolName=" + window.selectedSchool + "&subjectName=" + window.selectedSubject + "&levelName=" + window.selectedLevel + "&oldName=" + oldName + "&newName=" + newName).done(
                            function (ret) {
                                updateRename("unit", oldName, newName);
                                window.selectedUnit = newName;
                            }
                    )
                } else {
                    // bad chars sends error
                }
            } else {
                webix.message("Select a unit to rename");
            }
        } else {
            webix.message("Cannot rename games or tutorials");
        }
    }
}
window.currentUnitOutdated = false;
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
        /*
         {
         view: "button", value: "Help", width: 80, on: {
         onItemClick: function () {
         window.location.href = "help.php";
         }
         }
         },
         */
        {
            view: "label",
            template: "<p class='toolbarCenterLabel'>Select Unit</p>"
        },
        {width: 80},
        {
            view: "button", value: "Logout", width: 80, on: {
                onItemClick: function () {
                    window.location.href = "logout.php";
                }
            }
        }
    ]
};
var unitActions = {
    header: "Units",
    body: {
        rows: [
            {
                id: "selectPrompt",
                hidden: false,
                view: "label",
                label: "<-- Please select a School, Subject and Level",
                align: "center",
            },
            {height: 5},
            {
                id: "unitList",
                view: "list",
                select: "multiselect",
                autoheight: true,
                drag: true,
                template: "#school#: #subject# - #level# - " + '"' + "#name#" + '"' + " <span style='color:red;'>#outdated#</span>",
                data: [],
                on: {
                    onAfterDrop: function () {
                        var isOrigOrder = function () {
                            for (var i = 0; i < $$("unitList").data.order.length; i++) {
                                var cur = $$("unitList").data.order[i];
                                var last = $$("unitList").data.order[i - 1];
                                if (cur && last && cur < last) {
                                    return false;
                                }
                            }
                            return true;
                        };
                        console.log(isOrigOrder());
                        if (isOrigOrder()) {
                            $$("orderUnitAction").disable();
                        } else {
                            $$("orderUnitAction").enable();
                        }
                    },
                    onItemClick: function (id) {
                        var unitName = this.getItem(id).name;
                        var outdated = this.getItem(id).outdated;
                        window.currentUnitOutdated = (outdated == "OUTDATED") ? true : false;
                        if (currentUnitOutdated) {
                            $$("saveUnitActionOld").setValue("Update+View Old");
                            $$("saveUnitActionNew").setValue("Update+View New");
                        } else {
                            $$("saveUnitActionOld").setValue("View Old");
                            $$("saveUnitActionNew").setValue("View New");
                        }
                        if (isGame(unitName)) {
                            $$("uploadIconAction").enable();
                            $$("uploadIconAction").define("value", "Upload G" + isGame(unitName)[0] + " icon");
                            $$('uploadIconAction').data.upload = "ajax/upload/uploadGameIcon.php?" +
                                    "schoolName=" + window.selectedSchool +
                                    "&subjectName=" + window.selectedSubject +
                                    "&levelName=" + window.selectedLevel +
                                    "&unitName=" + unitName;
                        } else {
                            $$("uploadIconAction").define("value", "Upload icon");
                            $$("uploadIconAction").disable();
                            $$('uploadIconAction').data.upload = "";
                        }
                        $$("uploadIconAction").refresh();
                        $$("saveUnitActionOld").refresh();
                        $$("saveUnitActionNew").refresh();
                        $$("unitCombo").setValue(id);
                        $$("deleteUnit").enable();
                        $$("deleteUnitAction").enable();
                        $$("editUnitAction").enable();
                        $$("saveUnitActionOld").enable();
                        $$("saveUnitActionNew").enable();
                        $$("downloadUnit").enable();
                        window.selectedUnit = unitName;
                    }
                }
            },
            {
                id: "unitActionCont",
                hidden: false,
                height: 150,
                rows: [
                    {cols: [
                            {rows: [
                                    {},
                                    {
                                        id: "newUnitAction",
                                        view: "button",
                                        label: "Add Unit",
                                        disabled: true,
                                        on: {
                                            onItemClick: function () {
                                                newUnitAction();
                                            }
                                        }
                                    },
                                    {
                                        id: "newGameAction",
                                        view: "button",
                                        label: "Add Game",
                                        disabled: true,
                                        on: {
                                            onItemClick: function () {
                                                newGameAction();
                                            }
                                        }
                                    },
                                    {},
                                ]
                            },
                            {gravity: 0.05},
                            {rows: [
                                    {},
                                    {
                                        id: "editUnitAction",
                                        view: "button",
                                        label: "Edit",
                                        disabled: true,
                                        on: {
                                            onItemClick: function () {
                                                var win;
                                                win = window.open("stitch_app.php?schoolName=" + selectedSchool + "&subjectName=" + window.selectedSubject + "&levelName=" + window.selectedLevel + "&unitName=" + window.selectedUnit, '_blank');
                                                win.focus();
                                            }
                                        }
                                    },
                                    {
                                        id: "orderUnitAction",
                                        view: "button",
                                        label: "Order",
                                        disabled: true,
                                        on: {
                                            onItemClick: function () {
                                                var url = "ajax/set/setUnitOrder.php?schoolName=" + window.selectedSchool + "&subjectName=" + window.selectedSubject + "&levelName=" + window.selectedLevel;
                                                var orig = $$("unitList").data.pull;
                                                var newOrder = $$("unitList").data.order;
                                                var newArr = {};
                                                for (var i = 0; i < newOrder.length; i++) {
                                                    newArr[i] = orig[newOrder[i]].name;
                                                }
                                                ;
                                                $.ajax({
                                                    type: "POST",
                                                    url: url,
                                                    data: newArr,
                                                    success: function (ret) {
                                                        if (ret == "done") {
                                                            loadUnits(selectedSchool, selectedSubject, selectedLevel);
                                                            webix.message("Order saved");
                                                            $$("orderUnitAction").disable();
                                                        } else if (ret.split("error: ").length == 2) {
                                                            webix.message(ret);
                                                        } else {
                                                            // php error
                                                            document.body.innerHTML = ret;
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    },
                                    {
                                        cols: [
                                            {
                                                id: "saveUnitActionOld",
                                                view: "button",
                                                value: "View Old",
                                                disabled: true,
                                                on: {
                                                    onItemClick: function () {
                                                        if (window.currentUnitOutdated) {
                                                            saveUnit(function () {
                                                                reloadUnits();
                                                                viewUnit();
                                                            });
                                                        } else {
                                                            var url = "read.php?t=u&sc=" + btoa(selectedSchool) + "&su=" + btoa(selectedSubject) + "&l=" + btoa(selectedLevel) + "&u=" + btoa(selectedUnit);
                                                            if (window.selectedUnit == "Tutorial") {
                                                                url = "read.php?t=t&sc=" + btoa(selectedSchool) + "&u=" + btoa(selectedUnit);
                                                            }
                                                            var win = window.open(url, '_blank');
                                                            win.focus();
                                                        }
                                                    }
                                                }
                                            }, {
                                                id: "saveUnitActionNew",
                                                view: "button",
                                                value: "View New",
                                                disabled: true,
                                                on: {
                                                    onItemClick: function () {
                                                        if (window.currentUnitOutdated) {
                                                            saveUnit(function () {
                                                                reloadUnits();
                                                                viewUnit();
                                                            });
                                                        } else {
                                                            var url = "read.php?engineCode=new&t=u&sc=" + btoa(selectedSchool) + "&su=" + btoa(selectedSubject) + "&l=" + btoa(selectedLevel) + "&u=" + btoa(selectedUnit);
                                                            if (window.selectedUnit == "Tutorial") {
                                                                url = "read.php?engineCode=new&t=t&sc=" + btoa(selectedSchool) + "&u=" + btoa(selectedUnit);
                                                            }
                                                            var win = window.open(url, '_blank');
                                                            win.focus();
                                                        }
                                                    }
                                                }
                                            },
                                        ]
                                    },

                                    {},
                                ]
                            },
                            {gravity: 0.05},
                            {rows: [
                                    {},
                                    {
                                        id: "uploadIconAction",
                                        disabled: true,
                                        view: "uploader",
                                        value: "Upload icon",
                                        upload: "ajax/upload/uploadGameIcon.php",
                                        on: {
                                            onUploadComplete: function (ret) {
                                                webix.message("Upload complete!");
                                            },
                                            onUploadError: function (ret) {
                                                webix.message(ret);
                                            }
                                        },
                                    },
                                    {
                                        id: "updateAllAction",
                                        view: "button",
                                        label: "Update All",
                                        disabled: true,
                                        on: {
                                            onItemClick: function () {
                                                updateAllUnits();
                                            }
                                        }
                                    },
                                    {
                                        id: "deleteUnitAction",
                                        view: "button",
                                        css: "delete",
                                        label: "Delete",
                                        disabled: true,
                                        on: {
                                            onItemClick: function () {
                                                deleteUnitAction();
                                            }
                                        }
                                    },
                                    {},
                                ]
                            },
                        ]
                    },
                ]

            },
            {
                cols: [
                    {},
                    {},
                    {id: "downloadUnit", view: "button", disabled: true, value: "Download Unit", on: {
                            onItemClick: function () {
                                download("unit");
                            }
                        }},
                ],
            },
        ]
    },
};
function download(what) {
    var arr = [];
    if (what == "unit") {
        if (selectedSchool && selectedSubject && selectedLevel && selectedUnit) {
            arr = [selectedSchool, selectedSubject, selectedLevel, selectedUnit];
        } else {
            webix.message("error: No unit selected");
        }
    } else if (what == "tutorial") {
        if (selectedSchool && selectedTutorial) {
            var arr = [selectedSchool, "tutorials", selectedTutorial];
        } else {
            webix.message("error: No tutorial selected");
        }
    }
    if (arr.length) {
        var loc = "schools/" + arr.join("/");
        var zipName = arr.join("_");
        var url = "ajax/download/prepUnitDownload.php?loc=" + loc + "&name=" + zipName;
        webix.message("Preparing download...");
        $.ajax(url).done(
                function (ret) {
                    var isError = ret.split("error: ").length > 1;
                    if (isError) {
                        document.body.innerHTML = ret;
                    } else if (ret == "done") {
                        webix.message("Starting download...");
                        window.location.href = loc + "/" + zipName + ".zip";
                    } else {
                        document.body.innerHTML = ret;
                    }
                });
    }
}
var tutorialTypes = {"app": "<b>Application</b>", "float": "<i>Float</i>"};
function setTutorialTypes(subjects) {
    var options = $$("tutorialsTable").config.columns[1].options;
    // Deletes leftover subject specific crap
    for (var option in options) {
        if (option == "app" || option == "float" || typeof option == "undefined") {
            // Ignore
        } else {
            delete $$("tutorialsTable").config.columns[1].options[option];
        }
    }
    for (var subs in subjects) {
        $$("tutorialsTable").config.columns[1].options[subs] = subjects[subs];
    }
    console.log($$("tutorialsTable").config.columns[1].options);
    $$("tutorialsTable").refresh();
}

var tutorials = {
    header: "Tutorials",
    body: {
        view: "form",
        id: "editTutorials",
        hidden: false,
        elements: [
            {cols: [
                    {},
                    {view: "datatable", id: "tutorialsTable", minHeight: 300, width: 1030, rowHeight: 50, select: "multiselect", drag: true,
                        columns: [
                            {id: "order", header: "Order", width: 60, },
                            {id: "tutorialType", header: "Tutorial Type", editor: "select", options: tutorialTypes, width: 200, },
                            {id: "name", header: "Name", width: 250, editor: "text", },
                            {id: "icon", header: "Icon", width: 250},
                            {id: "outdated", header: "outdated", width: 250, },
                        ],
                        editable: true,
                        data: [
                        ],
                        on: {
                            onAfterSelect: function (e) {
                                var obj = $$(this).data.pull[e.id];
                                console.log(obj);
                                window.selectedTutorial = obj.name;
                                window.selectedTutorialID = obj.ID;
                                if (obj.outdated) {
                                    $$("viewTutorial").setValue("Update and view");
                                } else {
                                    $$("viewTutorial").setValue("View");
                                }
                                $$("viewTutorial").enable();
                                $$("viewTutorial").refresh();
                                $$("downloadTutorial").enable();
                                $$("deleteTutorial").enable();
                                $$("editTutorial").enable();
                            },
                            onEditorChange: function (e, val) {
                                if (e.column == "name") {
                                    console.log(val);
                                    var oldName = window.selectedTutorial;
                                    var newName = val;
                                    if (oldName !== newName) {
                                        var url = "ajax/rename/renameUnit.php?schoolName=" + window.selectedSchool + "&oldName=" + oldName + "&newName=" + newName + "&isTutorial=true";
                                        $.ajax(url).done(
                                                function (ret) {
                                                    var isError = ret.split("error: ").length > 1;
                                                    if (isError) {
                                                        document.body.innerHTML = ret;
                                                    } else if (ret == "done") {
                                                        webix.message("Tutorial renamed");
                                                    } else {
                                                        document.body.innerHTML = ret;
                                                    }
                                                }
                                        )
                                    }
                                } else if (e.column == "tutorialType") {
                                    var pass = true;
                                    var url = "ajax/set/setTutorialType.php?tutorialName=" + window.selectedTutorial + "&schoolName=" + window.selectedSchool;
                                    if (val == "app") {
                                        // app tutorial
                                        url += "&type=app";
                                    } else if (val == "float") {
                                        // Norm tutorial
                                        url += "&type=float";
                                    } else {
                                        // Subject tutorial
                                        var subName = $$("tutorialsTable").config.columns[1].options[val];
                                        url += "&type=sub&subjectName=" + subName;
                                    }
                                    $.ajax(url).done(
                                            function (ret) {
                                                var isError = ret.split("error: ").length > 1;
                                                if (isError) {
                                                    alert(ret);
                                                } else if (ret == "done") {
                                                    webix.message("Type updated");
                                                } else {
                                                    document.body.innerHTML = ret;
                                                }
                                            }
                                    );
                                }
                            },
                            onAfterDrop: function () {
                                $$("orderTutorials").enable();
                            },
                            onItemClick: function (e) {
                                if (e.column == "icon") {
                                    console.log(e);
                                    var tutName = $$("tutorialsTable").data.pull[e.row].name;
                                    $$("uploadTutorialIcon").data.upload = "ajax/upload/uploadTutorialIcon.php?school=" + window.selectedSchool + "&tutorial=" + tutName;
                                    $$("uploadTutorialIcon").fileDialog({rowid: e.row});
                                }
                            }
                        },
                    },
                    {},
                ]
            },
            {cols: [
                    {view: "button", value: "View", id: "viewTutorial", disabled: true, on: {onItemClick: function () {
                                function goTut() {
                                    var url = "read.php?t=t&sc=" + btoa(selectedSchool) + "&u=" + btoa(selectedUnit);
                                    var win = window.open(url, '_blank');
                                    win.focus();
                                }
                                if ($$(this).getValue() == "Update and view") {
                                    var url = "ajax/create/createUnit.php?";
                                    url += "unitID=" + window.selectedTutorialID + "&";
                                    url += "isTutorial=1";
                                    $.ajax({
                                        type: "POST",
                                        url: url,
                                        success: function (ret) {
                                            if (ret == "done") {
                                                loadTutorials(window.selectedSchool);
                                                goTut();
                                            } else {
                                                try {
                                                    var errors = window.eval(ret);
                                                    // if the try works, the errors are just my own, and the book will probably still work somewhat.
                                                    var errStr = errors.join("\r\r");
                                                    if (window.confirm("There were some errors:\r-----\r\r" + errStr + "\r")) {
                                                        goTut();
                                                    }
                                                } catch (e) {
                                                    // Errors weren't just my own, there's some serious problems
                                                    document.body.innerHTML = ret;
                                                }
                                            }
                                        },
                                        error: function (ret) {
                                            console.error(ret);
                                            webix.message("Error saving page list.");
                                            goTut();
                                        }
                                    });
                                } else {
                                    goTut();
                                }
                            }
                        }
                    },
                    {view: "button", value: "Edit", id: "editTutorial", disabled: true, on: {onItemClick: function () {
                                var win;
                                win = window.open("stitch_app.php?schoolName=" + selectedSchool + "&unitName=" + window.selectedTutorial + "&isTutorial=true", '_blank');
                                win.focus();
                            }}},
                    {view: "button", id: "orderTutorials", value: "Order", disabled: true, on: {
                            onItemClick: function () {
                                var url = "ajax/set/setUnitOrder.php?schoolName=" + window.selectedSchool + "&isTutorial=true";
                                var orig = $$("tutorialsTable").data.pull;
                                var newOrder = $$("tutorialsTable").data.order;
                                var newArr = {};
                                for (var i = 0; i < newOrder.length; i++) {
                                    newArr[i] = orig[newOrder[i]].name;
                                }
                                console.log(newArr);
                                $.ajax({
                                    type: "POST",
                                    url: url,
                                    data: newArr,
                                    success: function (ret) {
                                        if (ret == "done") {
                                            webix.message("Order saved");
                                            $$("orderTutorials").disable();
                                            loadTutorials();
                                        } else if (ret.split("error: ").length == 2) {
                                            webix.message(ret);
                                        } else {
                                            // php error
                                            document.body.innerHTML = ret;
                                        }
                                    }
                                });
                            }
                        }},
                    {template: "<div style='height:100%;width:100%;background-color:black;padding-left:10px;padding-right:10px;'></div>", css: "noPad", width: 5},
                    {view: "button", value: "Add", id: "newTutorial", disabled: true, on: {onItemClick: function () {
                                newTutorialAction();
                            }}},
                    {view: "button", id: "deleteTutorial", value: "Delete", css: "delete", disabled: true, on: {onItemClick: function () {
                                deletePrompt(window.selectedTutorial, "tutorial", "ajax/delete/deleteTutorial.php?schoolName=" + window.selectedSchool + "&tutorialName=" + window.selectedTutorial, loadTutorials);
                            }},
                    },
                ],
            },
            {
                cols: [
                    {},
                    {},
                    {},
                    {width: 7},
                    {},
                    {id: "downloadTutorial", view: "button", value: "Download Tutorial", disabled: true, on: {
                            onItemClick: function () {
                                download("tutorial");
                            }
                        }},
                ],
            },
        ],
    },
};
var selectUnits = {
    header: "Select",
    body: {
        view: "form",
        id: "editUnitForm",
        hidden: false,
        elements: [
            {
                // School
                cols: [
                    {
                        view: "combo", gravity: 3, value: 1, id: "schoolCombo", options: {
                            body: {
                                id: "schoolDropDown",
                                data: [
                                    {id: 1, value: " -- School -- "},
                                ],
                                on: {
                                    'onItemClick': function (id) {
                                        var schoolName = this.getItem(id).value;
                                        if (schoolName == " -- School -- ") {
                                            deselectCat(4);
                                            emptyTutorialDB();
                                        } else {
                                            deselectCat(3);
                                            $$("deleteSchool").enable();
                                            $$("subjectCombo").enable();
                                            $$("newSubject").enable();
                                            $$("newSubject").enable();
                                            $$("newTutorial").enable();
                                            window.selectedSchool = schoolName;
                                            loadSubjects(schoolName);
                                            loadTutorials(schoolName);
                                        }
                                    }
                                }
                            }
                        }, on: {
                            onKeyPress: function (e) {
                                if (e == 13 || e == 9) { // return or tab
                                    renameSchool($$("schoolCombo").getInputNode().value);
                                }
                            },
                        }
                    },
                    {
                        view: "button", value: "New", on: {
                            onItemClick: function () {
                                var school = window.prompt("Enter a name for the new school");
                                if (school && noBadNameChars(school)) {
                                    $.ajax("ajax/new/newSchool.php?schoolName=" + school).done(
                                            function (ret) {
                                                var isError = ret.split("error: ").length > 1;
                                                if (isError) {
                                                    alert(ret);
                                                } else if (ret == "done") {
                                                    loadSchools();
                                                } else {
                                                    document.body.innerHTML = ret;
                                                }
                                            }
                                    );
                                }
                            }
                        }
                    },
                    {
                        view: "button", value: "Delete", id: "deleteSchool", css: "delete", disabled: true, on: {
                            onItemClick: function () {
                                deletePrompt(selectedSchool, "school", "ajax/delete/deleteSchool.php?schoolName=" + selectedSchool, false);
                            }
                        }
                    }
                ]
            },
            {
                // Subject
                cols: [
                    {
                        view: "combo", gravity: 3, value: 1, id: "subjectCombo", disabled: true, options: {
                            body: {
                                id: "subjectDropDown",
                                data: [
                                    {id: 1, value: " -- Subject -- "},
                                ],
                                on: {

                                    onItemClick: function (id) {
                                        var subjectName = this.getItem(id).value;
                                        if (subjectName == " -- Subject -- ") {
                                            deselectCat(3);
                                        } else {
                                            deselectCat(2);
                                            $$("deleteSubject").enable();
                                            $$("levelCombo").enable();
                                            $$("newLevel").enable();
                                            window.selectedSubject = subjectName;
                                            loadLevels(window.selectedSchool, subjectName);
                                        }
                                    },
                                },
                            }
                        }, on: {
                            onKeyPress: function (e) {
                                if (e == 13 || e == 9) { // return or tab
                                    renameSubject($$("subjectCombo").getInputNode().value);
                                }
                            },
                        },
                    },
                    {
                        view: "button", value: "New", id: "newSubject", disabled: true, on: {
                            onItemClick: function () {
                                if (window.selectedSchool) {
                                    var subject = window.prompt("Enter a name for the new subject");
                                    if (subject && noBadNameChars(subject)) {
                                        $.ajax("ajax/new/newSubject.php?schoolName=" + window.selectedSchool + "&subjectName=" + subject).done(
                                                function (ret) {
                                                    var isError = ret.split("error: ").length == 2;
                                                    if (isError) {
                                                        //alert(ret);
                                                        webix.message(ret);
                                                    } else if (ret == "done") {
                                                        loadSubjects(selectedSchool);
                                                        loadTutorials(selectedSchool);
                                                    } else {
                                                        document.body.innerHTML = ret;
                                                    }
                                                }
                                        );
                                    }
                                } else {
                                    webix.message("Please select an associated school first");
                                }

                            }
                        }
                    },
                    {
                        view: "button", value: "Delete", id: "deleteSubject", css: "delete", disabled: true, on: {
                            onItemClick: function () {
                                deletePrompt(window.selectedSubject, "subject", "ajax/delete/deleteSubject.php?schoolName=" + window.selectedSchool + "&subjectName=" + window.selectedSubject, false);
                            }
                        }
                    }
                ]
            },
            {
                // Level
                cols: [
                    {
                        view: "combo", gravity: 3, value: 1, id: "levelCombo", disabled: true, options: {
                            body: {
                                id: "levelDropDown",
                                data: [
                                    {id: 1, value: " -- Level -- "},
                                ],
                                on: {
                                    'onItemClick': function (id) {
                                        var levelName = this.getItem(id).value;
                                        if (levelName == " -- Level -- ") {
                                            deselectCat(2);
                                        } else {
                                            deselectCat(1);
                                            $$("deleteLevel").enable();
                                            $$("unitCombo").enable();
                                            $$("newUnit").enable();
                                            $$("selectPrompt").hide();
                                            $$("newUnitAction").enable();
                                            $$("newGameAction").enable();
                                            window.selectedLevel = levelName;
                                            loadUnits(window.selectedSchool, window.selectedSubject, levelName);
                                        }
                                    }
                                }
                            }
                        }, on: {
                            onKeyPress: function (e) {
                                if (e == 13 || e == 9) { // return or tab
                                    renameLevel($$("levelCombo").getInputNode().value);
                                }
                            },
                        }
                    },
                    {
                        view: "button", value: "New", id: "newLevel", disabled: true, on: {
                            onItemClick: function () {
                                if (window.selectedSchool) {
                                    var level = window.prompt("Enter a name for the new level");
                                    if (level && noBadNameChars(level)) {
                                        $.ajax("ajax/new/newLevel.php?schoolName=" + window.selectedSchool + "&subjectName=" + window.selectedSubject + "&levelName=" + level).done(
                                                function (ret) {
                                                    var isError = ret.split("error: ").length == 2;
                                                    if (isError) {
                                                        //alert(ret);
                                                        webix.message(ret);
                                                    } else if (ret == "done") {
                                                        loadLevels(selectedSchool, selectedSubject);
                                                    } else {
                                                        document.body.innerHTML = ret;
                                                    }
                                                }
                                        );
                                    }
                                } else {
                                    webix.message("Please select an associated school first");
                                }

                            }
                        }
                    },
                    {
                        view: "button", value: "Delete", id: "deleteLevel", css: "delete", disabled: true, on: {
                            onItemClick: function () {
                                var url = "ajax/delete/deleteLevel.php?schoolName=" + window.selectedSchool + "&subjectName=" + window.selectedSubject + "&levelName=" + selectedLevel;
                                deletePrompt(selectedLevel, "level", url, false)
                            }
                        }
                    }
                ]
            },
            {
                // Unit
                cols: [
                    {
                        view: "combo", gravity: 3, value: 1, id: "unitCombo", disabled: true, options: {
                            body: {
                                id: "unitDropDown",
                                data: [
                                    {id: 1, value: " -- Unit -- "},
                                ],
                                on: {
                                    'onItemClick': function (id) {
                                        var unitName = this.getItem(id).value;
                                        if (unitName == " -- Unit -- ") {
                                            deselectCat(1);
                                        } else {
                                            $$("unitList").select(id);
                                            $$("deleteUnit").enable();
                                            $$("deleteUnitAction").enable();
                                            $$("editUnitAction").enable();
                                            $$("saveUnitActionOld").enable();
                                            $$("saveUnitActionNew").enable();
                                            $$("downloadUnit").enable();
                                            window.selectedUnit = unitName;
                                        }
                                    },
                                }
                            }
                        }, on: {
                            onKeyPress: function (e) {
                                if (e == 13 || e == 9) { // return or tab
                                    renameUnit($$("unitCombo").getInputNode().value);
                                }
                            },
                        }
                    },
                    {
                        view: "button", value: "New", id: "newUnit", disabled: true, on: {
                            onItemClick: function () {
                                newUnitAction();
                            }
                        }
                    },
                    {
                        view: "button", value: "Delete", id: "deleteUnit", css: "delete", disabled: true, on: {
                            onItemClick: function () {
                                deleteUnitAction();
                            }
                        }
                    }
                ]
            },
        ]
    }
};
function reloadUnits() {
    loadUnits(selectedSchool, selectedSubject, selectedLevel); // Clears the OUTDATED thing
}

function saveUnit(callback, which) {
    var url = "ajax/create/createUnit.php?";
    url += "schoolName=" + window.selectedSchool + "&";
    url += "subjectName=" + window.selectedSubject + "&";
    url += "levelName=" + window.selectedLevel + "&";
    if (which) {
        url += "unitName=" + which + "&";
    } else {
        url += "unitName=" + window.selectedUnit + "&";
    }
    $.ajax({
        type: "POST",
        url: url,
        success: function (ret) {
            if (ret == "done") {
                callback();
            } else {
                try {
                    var errors = window.eval(ret);
                    // if the try works, the errors are just my own, and the book will probably still work somewhat.
                    var errStr = errors.join("\r\r");
                    if (window.confirm("There were some errors:\r-----\r\r" + errStr + "\r")) {
                        callback();
                    }
                } catch (e) {
                    // Errors weren't just my own, there's some serious problems
                    document.body.innerHTML = ret;
                }
            }

        },
        error: function (ret) {
            console.error(ret);
            webix.message("Error saving page list.");
            callback();
        }
    });
}

function viewUnit() {
    var url = "read.php?t=u&sc=" + btoa(selectedSchool) + "&su=" + btoa(selectedSubject) + "&l=" + btoa(selectedLevel) + "&u=" + btoa(selectedUnit);
    var win = window.open(url, '_blank');
    win.focus();
}

function updateAllUnits() {
    $$("updateAllAction").define("label", "Updating...");
    $$("updateAllAction").disable();
    $$("updateAllAction").refresh();
    var units = $$("unitList").data.pull;
    var names = [];
    for (var u in units) {
        var unit = units[u];
        if (unit.name) {
            names.push(unit.name);
        }
    }
    function nextName() {
        if (names[0]) {
            console.log(names[0]);
            saveUnit(function () {
                names.shift();
                nextName();
            }, names[0]);
        } else {
            reloadUnits();
            $$("updateAllAction").define("label", "Update All");
            $$("updateAllAction").refresh();
        }
    }

    nextName();
}

function newUnitAction() {
    if (window.selectedSchool) {
        var unit = window.prompt("Enter a name for the new unit");
        if (unit && noBadNameChars(unit)) {
            if (!isGame(unit.toLowerCase())) {
                if (unit.toLowerCase() !== "Tutorial") {
                    $.ajax("ajax/new/newUnit.php?schoolName=" + window.selectedSchool + "&subjectName=" + window.selectedSubject + "&levelName=" + window.selectedLevel + "&unitName=" + unit).done(
                            function (ret) {
                                console.log(ret);
                                var isError = ret.split("error: ").length == 2;
                                if (isError) {
                                    //alert(ret);
                                    webix.message(ret);
                                } else if (ret == "done") {
                                    webix.message("done");
                                    loadUnits(selectedSchool, selectedSubject, selectedLevel);
                                } else {
                                    document.body.innerHTML = ret;
                                }
                            }
                    );
                } else {
                    webix.message("Cannot name a unit 'Tutorial'");
                }
            } else {
                webix.message("Cannot name a unit 'Game X dif Y'");
            }

        }
    } else {
        webix.message("Please select an associated school first");
    }
}

function newGameAction() {
    if (window.selectedSchool && window.selectedSubject && window.selectedLevel) {
        for (var r = 0; r < 3; r++) {
            for (var c = 0; c < 3; c++) {
                if (gamesInLevel[r][c]) {
                    $$("game" + (r + 1) + "level" + (c + 1)).disable();
                }
            }
        }
        $$("newGameWindow").show();
    } else {
        webix.message("Please select an associated school first");
    }
}

function newTutorialAction() {
    if (window.selectedSchool) {
        var name = window.prompt("Enter a name for the new unit");
        if (name && noBadNameChars(name)) {
            var url = "ajax/new/newUnit.php?schoolName=" + window.selectedSchool;
            if (window.selectedSubject) {
                url += "&subjectName=" + window.selectedSubject;
            }
            url += "&unitName=" + name + "&isTutorial=1";
            $.ajax(url).done(
                    function (ret) {
                        console.log(ret);
                        var isError = ret.split("error: ").length == 2;
                        if (isError) {
                            //alert(ret);
                            webix.message(ret);
                        } else if (ret == "done") {
                            webix.message("done");
                            if (window.selectedSubject && window.selectedLevel) {
                                loadUnits(selectedSchool, selectedSubject, selectedLevel);
                            }
                            loadTutorials(selectedSchool);
                        } else {
                            document.body.innerHTML = ret;
                        }
                    }
            );
        } else {
            webix.message("Bad characters in name, try again");
        }
    } else {
        webix.message("Please select a school first");
    }
}

function newIntroAction() {
    if (window.selectedSchool && window.selectedSubject) {
        var introExtists = false;
        if (!introExtists) {
            var unit = "Intro";
            $.ajax("ajax/new/newUnit.php?schoolName=" + window.selectedSchool + "&unitName=" + unit + "&isIntro=1").done(
                    function (ret) {
                        console.log(ret);
                        var isError = ret.split("error: ").length == 2;
                        if (isError) {
                            //alert(ret);
                            webix.message(ret);
                        } else if (ret == "done") {
                            webix.message("done");
                            loadUnits(selectedSchool, selectedSubject, selectedLevel);
                        } else {
                            document.body.innerHTML = ret;
                        }
                    }
            );
        }
    } else {
        webix.message("Subject already has tutorial");
    }
}

function deleteUnitAction() {
    var url = "ajax/delete/deleteUnit.php?schoolName=" + selectedSchool + "&subjectName=" + selectedSubject + "&levelName=" + selectedLevel + "&unitName=" + selectedUnit;
    deletePrompt(selectedUnit, "unit", url, function (ret) {
        reloadUnits();
    });
}

var elem = {
    id: "elem",
    rows: [
        {height: 10},
        {
            id: "Edit", cols: [
                selectUnits,
                unitActions,
            ]
        },
        tutorials,
        {},
    ]
};

function addGame() {
    var gameName = this.data.label;
    if (gameName && noBadNameChars(gameName)) {
        $.ajax("ajax/new/newUnit.php?schoolName=" + window.selectedSchool + "&subjectName=" + window.selectedSubject + "&levelName=" + window.selectedLevel + "&unitName=" + gameName + "&isGame=1").done(
                function (ret) {
                    var isError = ret.split("error: ").length == 2;
                    if (isError) {
                        //alert(ret);
                        webix.message(ret);
                    } else if (ret == "done") {
                        loadUnits(selectedSchool, selectedSubject, selectedLevel);
                        $$('newGameWindow').hide();
                    } else {
                        document.body.innerHTML = ret;
                    }
                }
        );
    }
}

function clearSchools() {
    for (var i = $$("schoolDropDown").count(); i > 0; i--) {
        $$("schoolDropDown").remove(i);
    }
}
function loadSchools() {
    $.ajax("ajax/get/getSchools.php").done(
            function (ret) {
                ret = window.eval(ret);
                for (var i = 0; i < ret.length; i++) {
                    ret[i].ID = i + 2;
                }
                for (var i = $$("schoolDropDown").count(); i > 0; i--) {
                    $$("schoolDropDown").remove(i);
                }
                $$("schoolDropDown").add({id: 1, value: " -- School -- "}, 0);
                for (var i = 1; i < ret.length + 1; i++) {
                    $$("schoolDropDown").add({id: ret[i - 1].ID, value: ret[i - 1].name}, i);
                }
                $$("schoolCombo").setValue(1);
                $$("schoolDropDown").refresh();
                $$("schoolCombo").refresh();
            }
    );
}

function loadSubjects(schoolName) {
    $.ajax("ajax/get/getSubjects.php?school=" + schoolName).done(
            function (ret) {
                ret = window.eval(ret);
                var subjectsForTutorials = {};
                for (var s = 0; s < ret.length; s++) {
                    subjectsForTutorials[ret[s].ID] = ret[s].name;
                }
                setTutorialTypes(subjectsForTutorials);
                for (var i = 0; i < ret.length; i++) {
                    ret[i].ID = i + 2;
                }
                for (var i = $$("subjectDropDown").count(); i > 0; i--) {
                    $$("subjectDropDown").remove(i);
                }
                $$("subjectDropDown").add({id: 1, value: " -- Subject -- "}, 0);
                for (var i = 1; i < ret.length + 1; i++) {
                    $$("subjectDropDown").add({id: ret[i - 1].ID, value: ret[i - 1].name}, i);
                }
                $$("subjectCombo").setValue(1);
                $$("subjectDropDown").refresh();
                $$("subjectCombo").refresh();
            }
    );
}
function loadLevels(schoolName, subjectName) {
    $.ajax("ajax/get/getLevels.php?school=" + schoolName + "&subject=" + subjectName).done(
            function (ret) {
                ret = window.eval(ret);
                for (var i = 0; i < ret.length; i++) {
                    ret[i].ID = i + 2;
                }
                for (var i = $$("levelDropDown").count(); i > 0; i--) {
                    $$("levelDropDown").remove(i);
                }
                $$("levelDropDown").add({id: 1, value: " -- Level -- "}, 0);
                for (var i = 1; i < ret.length + 1; i++) {
                    $$("levelDropDown").add({id: ret[i - 1].ID, value: ret[i - 1].name}, i);
                }
                $$("levelCombo").setValue(1);
                $$("levelDropDown").refresh();
                $$("levelCombo").refresh();
            }
    );
}
function loadUnits(schoolName, subjectName, levelName) {
    $.ajax("ajax/get/getUnits.php?school=" + schoolName + "&subject=" + subjectName + "&level=" + levelName).done(
            function (ret) {
                ret = window.eval(ret);
                console.log(ret);
                var outdatedNum = 0;
                window.gamesInLevel = [[], [], []];
                for (var i = 0; i < ret.length; i++) {
                    ret[i].ID = i + 2;
                    if (ret[i].outdated == 1) {
                        ret[i].outdated = "OUTDATED";
                        outdatedNum++;
                    } else {
                        ret[i].outdated = "";
                    }

                    var gameLoc = isGame(ret[i].name);
                    if (gameLoc) {
                        window.gamesInLevel[gameLoc[0] - 1][gameLoc[1] - 1] = ret[i];
                    }

                }
                // $$("newTutorialAction").enable();
                // $$("newIntroAction").enable();
                var unitListData = [];
                for (var i = 0; i < ret.length; i++) {
                    var curLevel = selectedLevel;
                    var curSubject = selectedSubject;
                    if (ret[i].name == "Tutorial") {
                        curLevel = "All Levels";
                        // $$("newTutorialAction").disable();
                    }
                    if (ret[i].name == "Intro") {
                        curSubject = "All Subjects";
                        // $$("newIntroAction").disable();
                    }
                    unitListData.push({
                        id: ret[i].ID,
                        name: ret[i].name,
                        school: selectedSchool,
                        subject: curSubject,
                        level: curLevel,
                        // unit: ret[i].order, // TODO: make order in db, set order with something something
                        unit: i,
                        outdated: ret[i].outdated,
                    });
                }

                // Delete old shit from list
                for (var i = $$("unitList").count() - 1; i >= 0; i--) {
                    $$("unitList").remove($$("unitList").data.order[i])
                }
                // Delete old shit from combo
                for (var i = $$("unitDropDown").count(); i > 0; i--) {
                    $$("unitDropDown").remove(i);
                }

                // Add new shit to list
                // $$("unitList").add({id: -1, "school": "testSchool", "subject": "math", "level": "ALL LEVELS", "name": "<b>Tutorial</b>", "outdated": ""});
                for (var i = 0; i < ret.length; i++) {
                    $$("unitList").add(unitListData[i]);
                }


                // Add new shit to combo
                // $$("unitDropDown").add({id: -1, value: " -- Tutorial -- "}, 0);
                $$("unitDropDown").add({id: 1, value: " -- Unit -- "}, 0);
                for (var i = 1; i < ret.length + 1; i++) {
                    $$("unitDropDown").add({id: ret[i - 1].ID, value: ret[i - 1].name}, i);
                }

                // refresh shit
                $$("unitList").refresh();
                $$("unitCombo").setValue(1);
                $$("unitDropDown").refresh();
                $$("unitCombo").refresh();
                if (outdatedNum > 1) {
                    $$("updateAllAction").enable();
                } else {
                    $$("updateAllAction").disable();
                }
            }
    );
}

function loadTutorials(schoolName) {
    if (!schoolName) {
        schoolName = window.selectedSchool;
    }
    if (!schoolName) {
        webix.message("Error loading tutorials, school not selected");
    } else {
        $.ajax("ajax/get/getTutorials.php?school=" + schoolName).done(
                function (ret) {
                    ret = window.eval(ret);
                    // clear datatable
                    emptyTutorialDB();
                    // add new data
                    if (ret) {
                        for (var n = 0; n < ret.length; n++) {
                            if (ret[n].tutorialType == "sub") {
                                ret[n].tutorialType = ret[n].subjectID;
                            }
                            ret[n].icon = "<img onerror=tutIconError(this) class='tutIcon' src='schools/" + window.selectedSchool + "/tutorials/" + ret[n].name + "/icons/icon.png' />";
                            $$("tutorialsTable").add(ret[n]);
                        }
                        $$("tutorialsTable").refresh();
                    }
                }
        )
    }
}
function emptyTutorialDB() {
    // clear datatable
    for (var n = $$("tutorialsTable").data.order.length; n >= 0; n--) {
        var id = $$("tutorialsTable").data.order[n];
        if (id) {
            $$("tutorialsTable").remove(id);
        }
    }
}
function isGame(name) {
    var sp = name.split(" ");
    if (sp[0] == "Game" && sp[2] == "dif" && sp.length == 4) {
        return [sp[1], sp[3]];
    } else {
        return false;
    }
}

function tutIconError(elem) {
    $(elem).src = "";
    $(elem).parent().html("<p class=tutIconFailText>Upload icon</p>");
}

$(document).ready(function () {
    loadSchools();
    webix.ui({
        view: "uploader",
        id: "uploadTutorialIcon",
        apiOnly: true,
        upload: "ajax/upload/uploadTutorialIcon.php",
        on: {onFileUpload: function () {
                loadTutorials()
            }
        }
    });
    webix.ui({
        view: "scrollview",
        width: "100%",
        body: {
            type: "space",
            rows: [
                header,
                elem,
            ]
        }
    });
    webix.ui({
        view: "window",
        id: "newGameWindow",
        position: "center",
        head: {
            view: "toolbar", margin: -4, cols: [
                {view: "label", label: "New game"},
                {view: "icon", icon: "times-circle",
                    click: "$$('newGameWindow').hide();"}
            ]
        },
        body: {
            height: 200,
            width: 500,
            template: "Some text",
            rows: [
                {},
                {
                    cols: [
                        {gravity: 0.1},
                        {view: "button", id: "game1level1", label: "Game 1 dif 1", on: {onItemClick: addGame}},
                        {gravity: 0.1},
                        {view: "button", id: "game2level1", label: "Game 2 dif 1", on: {onItemClick: addGame}},
                        {gravity: 0.1},
                        {view: "button", id: "game3level1", label: "Game 3 dif 1", on: {onItemClick: addGame}},
                        {gravity: 0.1},
                    ]
                },
                {gravity: 0.1},
                {
                    cols: [
                        {gravity: 0.1},
                        {view: "button", id: "game1level2", label: "Game 1 dif 2", on: {onItemClick: addGame}},
                        {gravity: 0.1},
                        {view: "button", id: "game2level2", label: "Game 2 dif 2", on: {onItemClick: addGame}},
                        {gravity: 0.1},
                        {view: "button", id: "game3level2", label: "Game 3 dif 2", on: {onItemClick: addGame}},
                        {gravity: 0.1},
                    ]
                },
                {gravity: 0.1},
                {
                    cols: [
                        {gravity: 0.1},
                        {view: "button", id: "game1level3", label: "Game 1 dif 3", on: {onItemClick: addGame}},
                        {gravity: 0.1},
                        {view: "button", id: "game2level3", label: "Game 2 dif 3", on: {onItemClick: addGame}},
                        {gravity: 0.1},
                        {view: "button", id: "game3level3", label: "Game 3 dif 3", on: {onItemClick: addGame}},
                        {gravity: 0.1},
                    ]
                },
                {},
            ]
        }
    });
})
