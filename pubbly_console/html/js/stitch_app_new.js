if (typeof window.isTutorial == "undefined") {
    window.isTutorial = false;
}
window.unitOrder = [];

// Series and all children (just names) (seriesObj.fruit = ["apples","bananas"])
window.seriesObj = [];
// All books (Just names and page count)
window.bookArr = [];

window.selectedSeriesName = false;
window.selectedChildName = false;
window.selectedBookName = false;

function setListData(id, data) {
    $$(id).clearAll();
    for (var d = 0; d < data.length; d++) {
        $$(id).add(data[d]);
    }
    $$(id).refresh();
    return true;
}

function getSeries() {
    $.ajax({
        type: "POST",
        url: "ajax/get/getSeriesList.php",
        success: function (ret) {
            ret = window.eval(ret);
            window.seriesList = ret;
            var justNames = [];
            let justFolders = [];
            for (var i = 0; i < ret.length; i++) {
                // i increments before getChild ajax call returns
                var seriesName = ret[i].name;
                let folderName = ret[i].folder;
                window.seriesObj[seriesName] = [];
                justNames.push(seriesName);
                if (justFolders.indexOf(folderName) === -1) {
                    justFolders.push(folderName);
                }
                if (i == 0) {
                    getChildren(seriesName, true);
                } else {
                    getChildren(seriesName, false);
                }
            }

            $$("selectSeriesFolderCombo").getList().parse(justFolders);

            $$("selectSeriesCombo").enable();
            $$("selectSeriesCombo").getList().clearAll();
            $$("selectSeriesCombo").getList().parse(justNames);
            $$("selectSeriesCombo").setValue(justNames[0]);
            $$("selectSeriesCombo").refresh();
            window.selectedSeriesName = justNames[0];
        }
    });
}

function getChildren(seriesName, populateAfter) {
    $.ajax({
        type: "POST",
        url: "ajax/get/getChildrenFromSeriesName.php?seriesName=" + seriesName,
        success: function (childRet) {
            var childRet = window.eval(childRet);
            for (var c = 0; c < childRet.length; c++) {
                window.seriesObj[seriesName].push(childRet[c].childName);
            }
            if (populateAfter) {
                setChildCombo(seriesObj[seriesName]);
            }
        }
    });
}

function setChildCombo(data) {
    $$("selectChildCombo").enable();
    $$("selectChildCombo").getList().clearAll();
    $$("selectChildCombo").getList().parse(data);
    $$("selectChildCombo").setValue(data[0]);
    $$("selectChildCombo").refresh();
    window.selectedChildName = data[0];
}

getSeries();

function getBooks() {
    $.ajax({
        type: "POST",
        url: "ajax/get/getBooks.php",
        success: function (ret) {
            ret = window.eval(ret);
            var justNames = [];
            for (var i = 0; i < ret.length; i++) {
                // i increments before getChild ajax call returns
                var bookName = ret[i].name;
                window.bookArr.push({ID: ret[i].ID, name: bookName});
                justNames.push(bookName);
            }
            $$("selectBookCombo").enable();
            $$("selectBookCombo").getList().clearAll();
            $$("selectBookCombo").getList().parse(justNames);
            $$("selectBookCombo").setValue(justNames[0]);
            $$("selectBookCombo").refresh();
            window.selectedBookID = justNames[0];
        }
    });
}

getBooks();

// TODO: Disable add buttons before ajax call, enable after ajax call. For both these two functions.
function addBookToWorkbench(bookID, bookName) {
    $.ajax({
        type: "POST",
        url: "ajax/get/getPagesFromChildOrBook.php?childOrBook=book&bookID=" + bookID,
        success: function (ret) {
            if (ret.split("error: ").length > 1) {
                webix.message(ret);
            } else {
                var obj = window.eval(ret);
                var obj = obj[0];
                if (obj.error) {
                    webix.message("Error: " + obj.error);
                } else {
                    console.log(obj);
                    pageCount = Number(obj.count);
                    var wbObj = {
                        name: bookName,
                        type: "Book",
                        height: obj.height,
                        width: obj.width,
                        pages: [],
                        pageCount: pageCount,
                    };
                    for (var i = 0; i < pageCount; i++) {
                        wbObj.pages.push({name: bookName, type: "Book", page: i + 1, height: obj.height, width: obj.width});
                    }
                    $$("workbench").add(wbObj);
                }
            }
        }
    })
}

function addChildToWorkbench(seriesName, childName) {
    $.ajax({
        type: "POST",
        url: "ajax/get/getPagesFromChildOrBook.php?childOrBook=child&seriesName=" + seriesName + "&childName=" + childName,
        success: function (ret) {
            if (ret.split("error: ").length > 1) {
                webix.message(ret);
            } else {
                var obj = window.eval(ret);
                var obj = obj[0];
                if (obj.error) {
                    webix.message("Error: " + obj.error);
                } else {
                    console.log(obj);
                    pageCount = Number(obj.count);
                    var wbObj = {
                        name: childName,
                        type: "Child",
                        height: obj.height,
                        width: obj.width,
                        pages: [],
                        pageCount: pageCount,
                    };
                    for (var i = 0; i < pageCount; i++) {
                        wbObj.pages.push({
                            name: childName,
                            type: "Child",
                            seriesName: seriesName,
                            page: i + 1,
                            height: obj.height,
                            width: obj.width
                        });
                    }
                    $$("workbench").add(wbObj);
                }
            }
        }
    })
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
            view: "button", value: "Select unit", width: 80, on: {
                onItemClick: function () {
                    window.location.href = "select_unit.php";
                }
            }
        },
        {
            view: "label",
            template: "<p class='toolbarCenterLabel'>Stitch app</p>"
        },
        {width: 80, },
        {
            view: "button", value: "Logout", width: 80, on: {
                onItemClick: function () {
                    window.location.href = "logout.php";
                }
            }
        }
    ]
};

function getUnitInfo(callback) {
    var url = "ajax/get/getUnitInfo.php?schoolName=" + schoolName + "&unitName=" + unitName;

    $.ajax({
        type: "GET",
        url: url,
        success: function (ret) {
            var ret = window.eval("[" + ret + "]");
            var ret = ret[0];
            if (typeof ret.TimeToInterrupt !== "undefined") {
                let val = (ret.TimeToInterrupt !== 0) ? 1 : 0;
                $$("interruptsAllowed").setValue(val);
                $$("interruptsAllowed").refresh();
            }
            if (typeof ret.PrjNameLong !== "undefined") {
                $$("longName").define("placeholder", ret.PrjNameLong);
                $$("longName").refresh();
            }
            if (typeof ret.ReturnPageToPreviousStateOnInterruptions !== "undefined") {
                var val = (ret.ReturnPageToPreviousStateOnInterruptions == "true") ? 1 : 0;
                $$("saveStates").setValue(val);
                $$("saveStates").refresh();
            }
            if (typeof ret.DisallowPageNavigation !== "undefined") {
                var val = (ret.DisallowPageNavigation == "true") ? 1 : 0;
                $$("allowNavigation").setValue(!val);
                $$("allowNavigation").refresh();
            }

        },
    });
}
getUnitInfo();

var unitInfoForm = {
    header: "Unit Info",
    body: {
        rows: [
            {
                cols: [
                    {
                        rows: [
                            {view: "text", name: "name", label: "Name: ", value: window.unitName, labelWidth: 130, disabled: true},
                            {
                                view: "text", id: "longName", name: "longName", label: "Long name: ", labelWidth: 130, on: {
                                    onKeyPress: function () {
                                        $$("saveInfo").enable();
                                    }
                                }
                            },
                            {view: "checkbox", label: "Save States", id: "saveStates", value: 1, labelWidth: 130, on: {
                                    onItemClick: function () {
                                        $$("saveInfo").enable();
                                    }
                                }
                            },
                            {
                                cols: [
                                    {
                                        view: "checkbox",
                                        id: "interruptsAllowed",
                                        label: "Allow interrupts",
                                        value: 1,
                                        labelWidth: 130,
                                        on: {
                                            onItemClick: function () {
                                                $$("saveInfo").enable();
                                            }
                                        }
                                    },
                                ]
                            },

                            {view: "checkbox", label: "Allow navigation", id: "allowNavigation", value: 1, labelWidth: 130, on: {
                                    onItemClick: function () {
                                        $$("saveInfo").enable();
                                    }
                                }
                            }
                        ]
                    },
                ]
            },
            {
                cols: [
                    {},
                    {
                        value: "Save info",
                        id: "saveInfo",
                        view: "button",
                        css: "save",
                        disabled: true,
                        height: 40,
                        autowidth: true,
                        on: {
                            onItemClick: function () {
                                var url = "ajax/set/setUnitInfo.php?schoolName=" + schoolName + "&unitName=" + unitName;
                                var data = {};
                                data.TimeToInterrupt = ($$("interruptsAllowed").getValue()) ? 0 : 1000;
                                data.PrjNameLong = $$("longName").getValue();
                                if (data.PrjNameLong == "") {
                                    delete data.PrjNameLong;
                                }
                                data.ReturnPageToPreviousStateOnInterruptions = Boolean($$("saveStates").getValue());
                                data.DisallowPageNavigation = !Boolean($$("allowNavigation").getValue());

                                $.ajax({
                                    type: "POST",
                                    url: url,
                                    data: data,
                                    success: function (ret) {
                                        webix.message("Info saved.");
                                        $$("saveInfo").disable();
                                    },
                                });
                            }
                        },
                    },
                ]
            }
        ]
    }
};

// All available pubbly books you can add to the pull list.
var library = {
    body: {
        height: 150, rows: [
            {label: "Library", view: "label", align: "center", css: "customHeader"},
            {
                rows: [
                    // Add pub from series and child
                    {
                        cols: [
                            {
                                rows: [
                                    {
                                        cols: [
                                            {
                                                label: "Series: ",
                                                labelWidth: 60,
                                                id: "selectSeriesFolderCombo",
                                                view: "combo",
                                                value: "...loading...",
                                                options: [
                                                ],
                                                on: {
                                                    onChange: function (folderName) {
                                                        let filtered = [];
                                                        for (let i = 0; i < window.seriesList.length; i++) {
                                                            if (window.seriesList[i].folder == folderName) {
                                                                filtered.push(window.seriesList[i].name);
                                                            }
                                                        }
                                                        $$("selectSeriesCombo").getList().clearAll();
                                                        $$("selectSeriesCombo").getList().parse(filtered);
                                                        $$("selectSeriesCombo").setValue(filtered[0]);
                                                        $$("selectSeriesCombo").refresh();
                                                    }
                                                }
                                            },
                                            {
                                                id: "selectSeriesCombo",
                                                view: "combo",
                                                value: "...loading...",
                                                disabled: true,
                                                options: [
                                                    "...loading...",
                                                ],
                                                on: {
                                                    onChange: function (newI, oldI) {
                                                        if (newI !== "- Series -") {
                                                            $$("selectChildCombo").enable();
                                                            if (newI !== oldI) {
                                                                // reorder something probably
                                                                setChildCombo(window.seriesObj[newI]);
                                                                window.selectedSeriesName = newI;
                                                            }
                                                        } else {
                                                            $$("selectChildCombo").disable();
                                                            $$("addPubFromSeries").disable();
                                                        }
                                                    }
                                                }
                                            },
                                        ]
                                    },
                                    {
                                        label: "Child: ",
                                        id: "selectChildCombo",
                                        view: "combo",
                                        labelWidth: 60,
                                        disabled: true,
                                        value: "...loading...",
                                        options: [
                                            "...loading...",
                                        ],
                                        on: {
                                            onChange: function (newI, oldI) {
                                                if (newI !== "- Children -") {
                                                    $$("addPubFromSeries").enable();
                                                    window.selectedChildName = newI;
                                                } else {
                                                    $$("addPubFromSeries").disable();
                                                }
                                            }
                                        }
                                    },
                                ]
                            },
                            {
                                width: 60, rows: [
                                    {gravity: 0.5},
                                    {
                                        value: "Add", id: "addPubFromSeries", disabled: true, view: "button", gravity: 1, on: {
                                            onItemClick: function () {
                                                addChildToWorkbench(window.selectedSeriesName, window.selectedChildName)
                                            }
                                        }
                                    },
                                    {gravity: 0.5},
                                ]
                            }
                        ]
                    },
                    {template: " "},
                    // Add pub from books
                    {
                        cols: [
                            {
                                label: "Statics: ",
                                id: "selectBookCombo",
                                view: "combo",
                                labelWidth: 60,
                                disabled: true,
                                value: "...loading...",
                                options: [
                                    "...loading...",
                                ],
                                on: {
                                    onChange: function (newI, oldI) {
                                        if (newI !== "- Books -") {
                                            $$("addFromBooks").enable();
                                            window.selectedBookName = newI;
                                        } else {
                                            $$("addFromBooks").disable();
                                        }
                                    }
                                }
                            },
                            {
                                value: "Add", id: "addFromBooks", disabled: true, width: 60, view: "button", on: {
                                    onItemClick: function () {
                                        var id = false;
                                        for (var b = 0; b < bookArr.length; b++) {
                                            if (bookArr[b].name == window.selectedBookName) {
                                                id = bookArr[b].ID;
                                            }
                                        }
                                        addBookToWorkbench(id, window.selectedBookName);
                                    }
                                }
                            }
                        ]
                    },
                ]
            }
        ]
    }
};

// List of books with pages you can pull out and add to the unit.
var workbench = {
    body: {
        rows: [
            {label: "Workbench", view: "label", align: "center", css: "customHeader"},
            {
                view: "list",
                id: "workbench",
                template: "#type#: #name# (#pageCount#) (#height#x#width#)",
                select: true,
                on: {
                    onItemClick: function (id) {
                        setListData("workbenchPageList", this.getItem(id).pages);
                        var name = this.getItem(id).name;
                        var height = this.getItem(id).height;
                        var width = this.getItem(id).width;
                        $$("workbenchPageListLabel").setValue(name + " (" + height + "x" + width + ")");
                        $$("removePubblyFromBench").enable();
                        $$("addAllWBPagesToUnit").enable();
                    }
                }
            },
            {
                cols: [
                    {},
                    {
                        value: "Remove",
                        id: "removePubblyFromBench",
                        view: "button",
                        css: "delete",
                        disabled: true,
                        on: {
                            onItemClick: function () {
                                var id = $$("workbench").getSelectedId();
                                $$("workbench").remove(id);
                                setListData("workbenchPageList", []);
                                $$("workbenchPageListLabel").setValue("- Select a book from your workbench -");
                                $$("removePubblyFromBench").disable();
                                $$("addAllWBPagesToUnit").disable();
                            }
                        }
                    },
                    {},
                ]
            },
        ]
    }
};

// List of pages available to add to unitPageList
var workbenchPageList = {
    body: {
        rows: [
            {label: "Workbench Page List", view: "label", align: "center", css: "customHeader"},
            {label: "- Select a book from your workbench -", view: "label", id: "workbenchPageListLabel", align: "center"},
            {
                view: "list",
                id: "workbenchPageList",
                align: "center", // Doesn't work! Damn!
                template: "#name# P: #page#",
                drag: true,
                select: true,
                data: [
                    /*
                     {page: 1, name: "S: Fruit C: Apples"},
                     {page: 2, name: "S: Fruit C: Apples"},
                     */
                ],
                on: {
                    onAfterDrop: function (ctx) {
                        // If dropped FROM units page list
                        if (ctx.from.$view.getAttribute("view_id") == "unitPageOrder") {
                            // Don't add the page to the list.
                            $$("workbenchPageList").remove(ctx.start);
                            if (!$$("unitPageOrder").data.order.length) {
                                $$("uniPageListLabel").setValue("Unit: " + unitName + "");
                            }

                            // If there are still pages in the order, then you should be able to save the fact that you deleted a page from the unit.
                            if ($$("unitPageOrder").data.order.length) {
                                $$("saveUnitPageOrder").enable();
                            }
                        }
                    }
                },
            },
            {
                cols: [
                    {},
                    {
                        value: "Add all ->", id: "addAllWBPagesToUnit", view: "button", disabled: true, on: {
                            onItemClick: function () {
                                var ids = $$("workbenchPageList").data.order.slice(); // the order will diminish every time you remove the thing, so dup the fuck and fuck the duck.
                                for (var i = 0; i < ids.length; i++) {
                                    var id = ids[i];
                                    var item = $$("workbenchPageList").getItem(id);
                                    var id = $$("unitPageOrder").data.order[0];
                                    var loc = $$("unitPageOrder").getItem(id);

                                    if (!loc || (item.height == loc.height && item.width == loc.width)) {
                                        $$("unitPageOrder").add(item);
                                        $$("workbenchPageList").remove(item.id);
                                    } else {
                                        i = ids.length;
                                        webix.message("Error: All pages in unit must have the same height and width");
                                    }

                                }
                                if (ids.length) {
                                    $$("saveUnitPageOrder").enable();
                                }
                            }
                        }
                    },
                    {},
                ]
            }
        ]
    }
};


// List of pages inside the unit you're editing. You can reorder and delete pages from unit.
var unitPageList = {
    body: {
        height: "auto", rows: [
            {label: "Unit Page List", view: "label", align: "center", css: "customHeader"},
            {label: "- Drag pages from your workbench page list -", view: "label", id: "uniPageListLabel", align: "center"},
            {
                view: "list",
                id: "unitPageOrder",
                align: "center", // Doesn't work! Damn!
                template: "#name# P: #page# (#height#x#width#)",
                drag: true,
                select: true,
                data: [
                    /*
                     {name: "Apples", page: 1, seriesName: "Fruit", type: "Child", height: 460, width:335.5},
                     */
                ],
                on: {
                    onAfterSelect: function () {
                        // enabling the delete button we got rid of. Maybe we'll bring it back.
                        // $$("removeUnitPage").enable();
                    },
                    onAfterDrop: function (ctx, e) {
                        var isOrigOrder = function () {
                            for (var i = 0; i < $$("unitPageOrder").data.order.length; i++) {
                                if ($$("unitPageOrder").data.order[i] !== window.unitOrder[i]) {
                                    return false;
                                }
                            }
                            return true;
                        };

                        // Dropped from workbench page list
                        if (ctx.from.$view.getAttribute("view_id") == "workbenchPageList") {
                            // There's no shit here (there was nothing, now there's one thing), set this as the new page dimensions.
                            if ($$(this).data.order.length == 1 && window.unitOrder.length == 0) {
                                var id = $$("unitPageOrder").data.order[0];
                                var loc = $$("unitPageOrder").getItem(id);
                                window.unitHeight = loc.height;
                                window.unitWidth = loc.width;
                                $$("uniPageListLabel").setValue("Unit: " + unitName + " (" + window.unitHeight + "x" + window.unitWidth + ")");
                            }
                            // there's shit here, check to make sure the page dimensions match
                            else {
                                var id = $$("unitPageOrder").data.order[$$("unitPageOrder").data.order.length - 1];
                                var loc = $$("unitPageOrder").getItem(id);
                                var newPageHeight = loc.height;
                                var newPageWidth = loc.width;
                                if (newPageHeight == window.unitHeight && newPageWidth == window.unitWidth) {
                                    // all good, it matches
                                } else {
                                    webix.message("Error: All pages in unit must have the same height and width");
                                    $$("unitPageOrder").remove(id);
                                }
                            }
                        }

                        // Reset the workbench page list prompt, delesect book from workbench
                        if (!$$("workbenchPageList").data.order.length) {
                            $$("workbench").unselect();
                            $$("workbenchPageListLabel").setValue("- Select a book from your workbench -");
                        }


                        if (isOrigOrder()) {
                            $$("saveUnitPageOrder").disable();
                            window.saveDisabled = true;
                        } else {
                            $$("saveUnitPageOrder").enable();
                            window.saveDisabled = false;
                        }
                    },
                },
            },
            // Save and delete buttons
            {
                cols: [
                    {
                        value: "Save", id: "saveUnitPageOrder", view: "button", disabled: true, on: {
                            onItemClick: function () {
                                saveUnit();
                            }
                        },
                    },
                    {
                        value: "View Old", id: "viewUnitOld", view: "button", disabled: false, on: {
                            onItemClick: function () {
                                var url = "read.php?t=u&sc=" + btoa(schoolName) + "&u=" + btoa(unitName);
                                if (window.saveDisabled) {
                                    var win = window.open(url, '_blank');
                                    win.focus();
                                } else {
                                    saveUnit(function () {
                                        var win = window.open(url, '_blank');
                                        win.focus();
                                    });
                                }
                            }
                        }
                    },
                    {
                        value: "View New", id: "viewUnitNew", view: "button", disabled: false, on: {
                            onItemClick: function () {
                                var url = "read.php?engineCode=new&t=u&sc=" + btoa(schoolName) + "&u=" + btoa(unitName);
                                if (window.saveDisabled) {
                                    var win = window.open(url, '_blank');
                                    win.focus();
                                } else {
                                    saveUnit(function () {
                                        var win = window.open(url, '_blank');
                                        win.focus();
                                    });
                                }
                            }
                        }
                    },
                ]
            },
        ]
    }
};

window.saveDisabled = true;

function saveUnit(callback) {
    var pageArrForPost = [];
    window.unitOrder = [];
    for (var i = 0; i < $$("unitPageOrder").data.order.length; i++) {
        window.unitOrder[i] = $$("unitPageOrder").data.order[i];
        var item = $$("unitPageOrder").getItem(window.unitOrder[i]);
        pageArrForPost.push({
            name: item.name,
            type: item.type,
            page: item.page,
            seriesName: item.seriesName,
        });
    }
    $$("saveUnitPageOrder").setValue("please wait");
    $$("saveUnitPageOrder").disable();
    window.saveDisabled = true;
    $$("saveUnitPageOrder").refresh();

    var stringyPost = JSON.stringify(pageArrForPost);
    var url = "ajax/set/setUnitPageList.php?";
    url += "schoolName=" + window.schoolName + "&";
    url += "unitName=" + window.unitName + "&";
    url += "pageObj=" + stringyPost + "&";


    $.ajax({
        type: "POST",
        url: url,
        success: function (ret) {
            // Page list has been saved in DB
            if (Number(ret) !== NaN) {
                var url = "ajax/create/createUnit.php?unitID=" + ret;
                if (isTutorial) {
                    url += "&isTutorial=true";
                }
                $.ajax({
                    type: "POST",
                    url: url,
                    success: function (ret) {
                        if (ret == "done") {
                            $$("saveUnitPageOrder").setValue("Save unit");
                            $$("saveUnitPageOrder").enable();
                            window.saveDisabled = false;
                            $$("saveUnitPageOrder").refresh();
                            webix.message("Unit saved");
                            if (callback) {
                                callback();
                            }
                        } else {
                            document.body.innerHTML = ret;
                        }
                    },
                    error: function (ret) {
                        console.error(ret);
                        webix.message("Error creating unit.");
                    }
                });
            } else {
                webix.message("The return from the order pages ajax call isn't an id... probably an error with that ajax... but I can't save without an id.");
            }
        },
        error: function (ret) {
            console.error(ret);
            webix.message("Error saving page list.");
        }
    });
}

function getUnitPages() {
    var url;
    url = "ajax/get/getUnitPages.php?";
    url += "schoolName=" + window.schoolName + "&";
    url += "unitName=" + window.unitName + "&";


    $.ajax({
        type: "POST",
        url: url,
        success: function (ret) {
            var pageList = false;
            try {
                pageList = window.eval(ret);
            } catch (e) {
                err = true;
                document.body.innerHTML = ret;
            }
            if (pageList) {
                if (pageList.length) {
                    window.unitWidth = Math.round(pageList[0].width);
                    window.unitHeight = Math.round(pageList[0].height);
                    for (var i = 0; i < pageList.length; i++) {
                        $$("unitPageOrder").add(pageList[i]);
                    }
                    $$("uniPageListLabel").setValue("Unit: " + unitName + " (" + pageList[0].height + "x" + pageList[0].width + ")");
                } else {

                }
            }
        }
    });
}

getUnitPages();

// Has header of where ref page is from
// NOT USED YET!
var previewContainer = {
    body: {
        height: "auto", rows: [
            {label: "Page preview", view: "label", align: "center", css: "customHeader"},
            {template: "<div id=previewCont style='border:1px solid black; height:100%'></div>"}
        ]
    }
};

$(document).ready(function () {
    webix.ui({
        view: "scrollview",
        width: "100%",
        body: {
            type: "space",
            rows: [
                header,
                {
                    cols: [
                        {
                            rows: [
                                library,
                                workbench,
                            ]
                        },
                        workbenchPageList,
                        {
                            rows: [
                                unitInfoForm,
                                unitPageList
                            ]
                        }
                        // previewContainer,
                    ]
                }
            ]
        }
    });
})
