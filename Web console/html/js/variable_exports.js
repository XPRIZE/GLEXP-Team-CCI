window.uploadParentDropzoneAttached = false;
window.reuploadParentDropzoneAttached = false;
window.newSeriesTimeout = false;

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
            template: "<p class='toolbarCenterLabel'>Variable Exports</p>"
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
;

function getSeries(callback) {
    /*
     var ret = [{"ID": 7, "name": "Food", "children": ["Apples", "Banana", "Cucumbers"]}, {
     "ID": 8,
     "name": "Numbers",
     "children": []
     }, {"ID": 9, "name": "Letters", "children": []}, {"ID": 10, "name": "TestSeries", "children": []}, {
     "ID": 11,
     "name": "asdf",
     "children": []
     }, {"ID": 12, "name": "a", "children": []}, {"ID": 13, "name": "b", "children": []}, {
     "ID": 14,
     "name": "qwerty",
     "children": []
     }, {"ID": 15, "name": "qweryr", "children": []}, {"ID": 16, "name": "qrweqrwerqew", "children": []}, {
     "ID": 17,
     "name": "dfch",
     "children": []
     }];
     */
    $.ajax({
        type: 'get',
        url: 'ajax/get/getSwapAppSeriesList.php',
        success: function (ret) {
            if (ret.substring(0, 6) == "<br />") {
                document.body.innerHTML = ret;
            } else {
                var obj = window.eval(ret); // Maybe have to find a better eval with a third party thingy later on.
                callback(obj);
            }
        }
    })
}

function reorderSeriesList(type, dir) {
    var ids = $$("seriesList").data.order.slice(); // array of ids, slice to dup not point
    var objs = $$("seriesList").data.pull; // Objects (named their ids) and the props
    var newOrder = [];
    var newObjs = [];
    if (type == "date") {
        for (var s in objs) {
            newOrder[objs[s].ID] = objs[s].id;
        }
        if (dir == "desc") {
            for (var s = 0; s < newOrder.length; s++) {
                if (newOrder[s]) {
                    newObjs.push(objs[newOrder[s]]);
                }
            }
        } else if (dir == "asc") {
            for (var s = newOrder.length; s >= 0; s--) {
                if (newOrder[s]) {
                    newObjs.push(objs[newOrder[s]]);
                }
            }
        }
    } else if (type == "name") {
        for (var o in objs) {
            newObjs.push(objs[o]);
        }
        ;
        if (dir == "asc") {
            newObjs.sort(function (a, b) {
                var textA = a.name.toUpperCase();
                var textB = b.name.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
        } else if (dir == "desc") {
            newObjs.sort(function (a, b) {
                var textA = a.name.toUpperCase();
                var textB = b.name.toUpperCase();
                return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
            });
        }
        // TODO: Figure out how the hell sort functions work.
    }

    // Expecting a sorted newObjs here
    if (newObjs.length) {
        for (var s = 0; s < ids.length; s++) {
            $$("seriesList").remove(ids[s]);
        }
        for (var s = 0; s < newObjs.length; s++) {
            $$("seriesList").add(newObjs[s]);
        }
        $$("seriesList").refresh();
    }
}
$(document).ready(function () {

    getSeries(function (ret) {
        
        seriesData = ret;
        let folders = [];
        seriesData.map(s => {
            if (folders.indexOf(s.folder) === -1) {
                folders.push(s.folder);
            }
        });
        let i = 0;
        treeData = folders.map(f => {
            i++;
            let ret = {
                id: "0." + i,
                open: false,
                folder: f,
                data: []
            };
            let ii = 0;
            seriesData.map(s => {
                ii++;
                s.folder = (typeof s.folder == "undefined") ? "" : s.folder;
                if (s.folder === f) {
                    let d = {
                        id: s.ID,
                        value: s.name + ": " + s.children.length + " children",
                        name: s.name,
                        children: s.children,
                    };
                    ret.data.push(d);
                }
            });
            ret.value = f;
            return ret;
        });
        // Sort folders alphabetasiehoiub
        treeData.sort(function (a, b) {
            if (a.folder === "" || b.folder === "") {
                return (a.folder === "") ? -1 : 1;
            } else {
                if (a.folder < b.folder) {
                    return -1;
                } else {
                    return 1;
                }
            }
        });

        console.log(folders);

        var seriesList = {
            width: "50%",
            rows: [
                {
                    view: "tree",
                    id: "seriesList",
                    scroll: "y",
                    // template: "#name#: #length# children",
                    select: true,
                    data: treeData,
                    drag: true,
                    on: {
                        onBeforeDrop: function (context) {
                            let seriesID = context.start;
                            let pid, spri, folderName;
                            if (context.parent > 0) {
                                // Dropping on folder
                                pid = context.parent;
                                spri = context.index + 1;
                            } else {
                                pid = context.target;
                                spri = 0;
                            }
                            if (seriesID.split(".").length > 1) {
                                // Dropping folder
                                context.parent = 0;
                            } else {
                                folderName = this.getItem(pid).folder;
                                context.parent = pid;
                                $.ajax({
                                    type: 'get',
                                    url: 'ajax/set/setSeriesFolder.php',
                                    data: {"seriesID": seriesID, "folderName": folderName},
                                    success: function (ret) {
                                        if (ret == "done") {
                                            // window.location.href = window.location.href;
                                            // webix.message("Folder changed");
                                        } else {
                                            window.alert(ret + "</br>Please contact support");
                                            document.body.innerHTML = ret;
                                        }
                                    }
                                })
                            }
                        },
                        onAfterDrop: function (context) {
                            let newOrder = this.data.order.filter(id => {
                                if (id.split && id.split(".")[1]) {
                                    // folder
                                } else {
                                    return id;
                                }
                            });
                            let orderByID = {};
                            for (let i = 0; i < newOrder.length; i++) {
                                orderByID[newOrder[i]] = i;
                            }
                            $.ajax({
                                type: 'post',
                                url: 'ajax/set/setSeriesOrder.php',
                                data: {"orderByID": JSON.stringify(orderByID)},
                                success: function (ret) {
                                    if (ret == "done") {
                                        // window.location.href = window.location.href;
                                        //webix.message("Order updated");
                                    } else {
                                        window.alert(ret + "</br>Please contact support");
                                        document.body.innerHTML = ret;
                                    }
                                }
                            })
                        },
                        onItemClick: function (id) {
                            var obj = this.getItem(id);
                            if (typeof obj.folder !== "undefined") {
                                obj.open = !obj.open;
                                $$("seriesList").refresh();
                                return false;
                            } else {
                                var seriesName = obj.name;
                                window.selectedSeries = seriesName;
                                var seriesKids = obj.children;
                                window.selectedSeriesKids = obj.children;
                                // seriesName
                                $$("seriesName").setValue(seriesName);
                                $$("seriesName").refresh();
                                $$("startSwapping").enable();
                                $$("downloadParent").enable();
                                $$("deleteSeries").enable();
                                $$("backupSeries").enable();
                                $$("renameSeries").enable();
                                $$("goSeries").enable();
                                for (var i = $$("childSelectorDropDown").count(); i > 0; i--) {
                                    $$("childSelectorDropDown").remove(i);
                                }
                                $$("childSelectorDropDown").add({id: 1, value: " -- Choose -- "}, 0);
                                for (var i = 1; i < seriesKids.length + 1; i++) {
                                    $$("childSelectorDropDown").add({id: i + 1, value: seriesKids[i - 1]}, i);
                                }
                                $$("childSelector").setValue(1);
                                $$("childSelectorDropDown").refresh();
                                $$("childSelector").refresh();
                                $$("reuploadParentDZ").expand();
                                attachDropzoneEvents(seriesName, "reuploadParent", function () {
                                    // Callback is what happens after a successful reupload
                                    window.location.href = window.location.href;
                                });
                            }
                        }
                    }
                }
            ]

        };
        let newFolder = {
            width: 90,
            view: "button",
            value: "New folder",
            on: {
                onItemClick: function () {
                    let folderName = prompt("Enter a new folder name. (Note, it will not save until you put a series in it");
                    if (folderName) {
                        let found = false;
                        let pull = $$("seriesList").data.pull;
                        let fc = 1;
                        for (let i in pull) {
                            let fn = pull[i].folder;
                            if (fn) {
                                fc++;
                            }
                            found = found || (fn == folderName);
                        }
                        fc++;
                        if (!found) {
                            $$("seriesList").data.add({
                                id: "forceFolderIcon",
                                open: true,
                                folder: folderName,
                                value: folderName,
                                data: [],
                            });
                            $$("seriesList").refresh();
                            // css override rule for .webix_tree_branch_1 > .webix_tree_item  .webix_tree_file -- force all 1st level "files" to show folder icons.
                        }
                    }
                }
            }
        };
        let renameFolder = {view: "button", value: "Rename folder", disabled: true};
        let batchMove = {view: "button", value: "Put selection in folder", disabled: true};
        var seriesActions = {
            id: "actionBody",

            width: "50%",
            rows: [
                {
                    cols: [
                        newFolder,
                        renameFolder,
                        batchMove,
                    ]
                },
                {template: "<br>", height: 10},
                {
                    cols: [
                        {view: "label", label: "Parent:", align: "center", gravity: 1},
                        {
                            view: "text",
                            id: "seriesName",
                            value: "",
                            gravity: 3,
                            inputAlign: "center",
                            disabled: true
                        },
                        {
                            view: "button", id: "renameSeries", value: "Rename", gravity: 1.5, disabled: true, on: {
                                onItemClick: function () {
                                    var newName = window.prompt("Enter a new name for the series");
                                    if (newName) {
                                        let pull = $$("seriesList").data.pull;
                                        let taken = false;
                                        for (let s in pull) {
                                            taken = (typeof pull[s].folder == "undefined" && pull[s].name == newName) || taken;
                                        }
                                        if (taken) {
                                            webix.message("Name taken");
                                        } else {
                                            var THIS = this;
                                            $$(this).disable();
                                            $$(this).setValue("Please wait...");
                                            $$(this).refresh();
                                            $.ajax({
                                                type: 'get',
                                                url: 'ajax/rename/renameSeries.php',
                                                data: {"oldName": window.selectedSeries, "newName": newName},
                                                success: function (ret) {
                                                    if (ret == "done") {
                                                        window.location.href = window.location.href;
                                                    } else {
                                                        window.alert(ret + "</br>Please contact support");
                                                        document.body.innerHTML = ret;
                                                    }
                                                }
                                            })
                                        }
                                    }
                                }
                            }
                        },
                        {
                            view: "button", id: "goSeries", value: "View", gravity: 1.5, disabled: true, on: {
                                onItemClick: function () {
                                    if (window.selectedSeries) {
                                        /*
                                         var loc = window.selectedSeries + "/index.php";
                                         window.location.href = loc;
                                         */
                                        webix.message("Coming soon. Maybe. Not really sure what 'A series' should look like... but I may have some use for this button and I don't want to have to restyle");
                                    } else {
                                        $$(this).disable();
                                    }
                                }
                            }
                        },
                    ]
                },
                {
                    rows: [
                        {
                            cols: [
                                {view: "label", label: "Child: ", gravity: 1, align: "center"},
                                {
                                    view: "combo", id: "childSelector", gravity: 3, value: 1, options: {
                                        body: {
                                            id: "childSelectorDropDown",
                                            data: [
                                                {id: 1, value: " -- Choose -- "},
                                            ],
                                            on: {
                                                'onItemClick': function (id) {
                                                    var childName = this.getItem(id).value;
                                                    if (childName == " -- choose -- ") {
                                                        $$("goChildOld").disable();
                                                        $$("goChildNew").disable();
                                                        $$("renameChild").disable();
                                                        $$("deleteChild").disable();
                                                        window.selectedChild = false;
                                                    } else {
                                                        $$("goChildOld").enable();
                                                        $$("goChildNew").enable();
                                                        $$("renameChild").enable();
                                                        $$("deleteChild").enable();
                                                        window.selectedChild = childName;
                                                    }
                                                }
                                            }
                                        }
                                    },
                                },
                                {
                                    view: "button", id: "renameChild", value: "Rename", gravity: 1, disabled: true, on: {
                                        onItemClick: function () {
                                            var newName = window.prompt("Enter a new name for the series");
                                            // Makes sure you're not renaming a child the same name as another child.
                                            let errolCheck = false;
                                            for (let s = 0; s < selectedSeriesKids.length; s++) {
                                                if (selectedSeriesKids[s] == newName) {
                                                    errolCheck = true;
                                                }
                                            }
                                            if (newName) {
                                                if (errolCheck) {
                                                    window.alert("Already a child in this series with that name");
                                                } else {
                                                    var THIS = this;
                                                    $$(this).disable();
                                                    $$(this).setValue("Please wait...");
                                                    $$(this).refresh();
                                                    $.ajax({
                                                        type: 'get',
                                                        url: 'ajax/rename/renameChild.php',
                                                        data: {
                                                            "series": window.selectedSeries,
                                                            "oldName": window.selectedChild,
                                                            "newName": newName
                                                        },
                                                        success: function (ret) {
                                                            if (ret == "done") {
                                                                window.location.href = window.location.href;
                                                            } else {
                                                                window.alert(ret + "</br>Please contact support");
                                                                document.body.innerHTML = ret;
                                                            }
                                                        }
                                                    })
                                                }
                                            }

                                        }
                                    }
                                },
                            ]
                        },
                        {
                            cols: [

                                {
                                    view: "button",
                                    id: "deleteChild",
                                    value: "Delete",
                                    gravity: 1,
                                    disabled: true,
                                    css: "delete",
                                    on: {
                                        onItemClick: function () {
                                            var url = "ajax/delete/deleteChild.php?seriesName=" + window.selectedSeries + "&childName=" + window.selectedChild;
                                            deletePrompt(selectedChild, "child", url, false);
                                        }
                                    }
                                },
                                {
                                    view: "button", id: "goChildOld", value: "View new", gravity: 1, disabled: true, on: {
                                        onItemClick: function () {
                                            if (window.selectedChild) {
                                                let sn = btoa(window.selectedSeries);
                                                let cn = btoa(window.selectedChild);
                                                var win = window.open("read.php?engineCode=new&t=c&sn=" + sn + "&cn=" + cn, '_blank');
                                            } else {
                                                $$(this).disable();
                                            }
                                        }
                                    }
                                },
                                {
                                    view: "button", id: "goChildNew", value: "View old", gravity: 1, disabled: true, on: {
                                        onItemClick: function () {
                                            if (window.selectedChild) {
                                                let sn = btoa(window.selectedSeries);
                                                let cn = btoa(window.selectedChild);
                                                var win = window.open("read.php?t=c&sn=" + sn + "&cn=" + cn, '_blank');
                                            } else {
                                                $$(this).disable();
                                            }
                                        }
                                    }
                                },
                            ]
                        },
                    ]
                },
                {
                    cols: [
                        {},
                        {
                            view: "button",
                            id: "deleteSeries",
                            value: "Delete series",
                            width: 150,
                            css: "delete",
                            disabled: true,
                            on: {
                                onItemClick: function () {
                                    var url = "ajax/delete/deleteSeries.php?seriesName=" + selectedSeries;
                                    deletePrompt(selectedSeries, "series", url, function () {
                                        let at = $$("seriesList").find(function (a) {
                                            if (a.name == selectedSeries)
                                                return a;
                                        })[0];
                                        if (at && at.id) {
                                            $$("seriesList").remove(at.id);
                                        }
                                    });
                                }
                            }
                        },
                        {},
                        {
                            view: "button",
                            id: "startSwapping",
                            value: "Swap App",
                            width: 150,
                            disabled: true,
                            on: {
                                onItemClick: function (item) {
                                    window.location.href = "swap_app.php?series_name=" + btoa(window.selectedSeries);
                                }
                            }
                        },
                        {},
                    ]
                },
                {
                    cols: [
                        {},
                        {
                            view: "button",
                            value: "Backup series",
                            id: "backupSeries",
                            disabled: true,
                            width: 150,
                            tooltip: "Save a local copy of the series (Images, audios, swaps, text fields, everything)",
                            on: {
                                onItemClick: function () {
                                    var THIS = this;
                                    if ($$(this).getValue() == "Backup series") {
                                        $$(THIS).disable();
                                        $$(THIS).setValue("preparing...");
                                        $$(THIS).refresh();
                                        $.ajax("ajax/misc/backupSeries.php?seriesName=" + window.selectedSeries).done(function (ret) {
                                            $$(THIS).setValue("Start download!");
                                            $$(THIS).refresh();
                                            $$(THIS).enable();
                                        });
                                    } else {
                                        var win = window.open("downloads/" + window.selectedSeries + "_backup.zip", '_blank');
                                        win.focus();
                                        $$(THIS).setValue("Backup series");
                                        $$(THIS).refresh();
                                    }
                                }
                            }
                        },
                        {},
                        {
                            view: "button",
                            value: "Download Parent",
                            id: "downloadParent",
                            disabled: true,
                            width: 150,
                            tooltip: "Download the last good parent.zip upload.",
                            on: {
                                onItemClick: function () {
                                    var loc = "zips/" + window.selectedSeries + "_parent.zip";
                                    $.ajax({
                                        url: loc,
                                        type: 'HEAD',
                                        error: function ()
                                        {
                                            window.location.href = "series/" + window.selectedSeries + "/Parent.zip"; // boo last gen
                                        },
                                        success: function ()
                                        {
                                            window.location.href = loc; // yay next gen
                                        }
                                    });
                                }
                            }
                        },
                        {},
                    ]
                },
                {
                    header: "Reupload parent", id: "reuploadParentDZ", height: 260, collapsed: true,
                    body: {
                        id: "reuploadParent",
                        template: '<form action="ajax/upload/uploadParent.php" class="dropzone" id="reuploadParent"><div class="dz-message" data-dz-message><span>Upload Zip file</span></div></form>',
                        gravity: 1,
                        minHeight: 220,
                    },
                },
            ],
        };
        
        var elem = {
            view: "scrollview",
            width: "100%",
            body: {
                rows: [
                    header,
                    {
                        view: "tabview",
                        id: "editAndCreateTab",
                        cells: [
                            {
                                header: "Edit Series",
                                rows: [
                                    {
                                        cols: [
                                            // seriesList goes here,
                                            // seriesActions goes here
                                        ]
                                    },
                                ],
                            },
                            {
                                id: "createTab",
                                header: "New Series",
                                cols: [
                                    {gravity: 1},
                                    {
                                        gravity: 5,
                                        maxWidth: 400,
                                        autoheight: true,
                                        rows: [
                                            {height: 10, },
                                            {
                                                header: "Step 1", collapsed: false, body: {
                                                    view: "form",
                                                    gravity: 1,
                                                    elements: [
                                                        {
                                                            view: "text",
                                                            label: "Name Series: ",
                                                            id: "newSeriesName",
                                                            labelWidth: 150,
                                                            on: {
                                                                onTimedKeyPress: function () {
                                                                    var requestName = $$("newSeriesName").getValue();
                                                                    if (requestName) {
                                                                        if (newSeriesTimeout) {
                                                                            window.clearTimeout(newSeriesTimeout);
                                                                        }
                                                                        $$("newSeries").disable();
                                                                        $$("newSeries").setValue("Checking...");
                                                                        $$("newSeries").refresh();
                                                                        window.newSeriesTimeout = window.setTimeout(function () {
                                                                            var jqxhr = $.ajax("ajax/check/checkSeriesName.php?name=" + requestName)
                                                                                    .done(function (ret) {
                                                                                        if (ret == "") {
                                                                                            $$("newSeries").enable();
                                                                                            $$("newSeries").setValue("Create new series");
                                                                                            $$("newSeries").refresh();
                                                                                        } else {
                                                                                            $$("newSeries").disable();
                                                                                            $$("newSeries").setValue("Name taken");
                                                                                            $$("newSeries").refresh();
                                                                                        }
                                                                                    })
                                                                                    .fail(function () {
                                                                                        alert("error");
                                                                                    })
                                                                        }, 500);
                                                                    } else {
                                                                        $$("newSeries").disable();
                                                                        $$("newSeries").setValue("Enter a name");
                                                                        $$("newSeries").refresh();
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        {
                                                            view: "combo",
                                                            label: "Select folder: ",
                                                            id: "newSeriesFolderName",
                                                            labelWidth: 150,
                                                            options: folders,
                                                            placeholder: "General Unsorted"
                                                        },
                                                        {
                                                            view: "button",
                                                            id: "newSeries",
                                                            value: "Enter a name",
                                                            disabled: true,
                                                            on: {
                                                                onItemClick: function () {
                                                                    $$("newSeriesName").disable();
                                                                    $$(this).disable();
                                                                    $$(this).setValue("Please wait...");
                                                                    $$(this).refresh();
                                                                    var requestName = $$("newSeriesName").getValue();
                                                                    var requestFolder = $$("newSeriesFolderName").getValue();
                                                                    if (requestName) {
                                                                        // Check one last time, just to be safe and stuff and things and
                                                                        $.ajax("ajax/check/checkSeriesName.php?name=" + requestName).done(function (ret) {
                                                                            if (ret == "") {
                                                                                $.ajax("ajax/new/newSeries.php?name=" + requestName + "&folder=" + requestFolder).done(function (ret) {
                                                                                    if (ret == "true" || ret == 1) {
                                                                                        window.newSeriesName = requestName;
                                                                                        $$('uploadParentDZ').enable();
                                                                                        $$('uploadParentDZ').expand();
                                                                                        attachDropzoneEvents(requestName, "uploadParent", function () {
                                                                                            $$('editChildren').enable();
                                                                                            $$('editChildrenCont').enable();
                                                                                            $$('editChildrenCont').expand();
                                                                                        });
                                                                                        $$("newSeries").disable();
                                                                                        $$("newSeries").setValue("Upload parent");
                                                                                        $$("newSeries").refresh();
                                                                                        $$('uploadParentDZ').enable();
                                                                                        $$('uploadParentDZ').expand();
                                                                                    } else {
                                                                                        console.error(ret);
                                                                                    }
                                                                                });
                                                                            } else {
                                                                                $$("newSeries").disable();
                                                                                $$("newSeries").setValue("Name taken");
                                                                                $$("newSeries").refresh();
                                                                                $$("newSeriesName").enable();
                                                                            }
                                                                        });
                                                                    } else {
                                                                        $$(this).enable();
                                                                        $$(this).setValue("Enter a name");
                                                                        $$("newSeriesName").enable();
                                                                    }
                                                                }
                                                            }
                                                        },
                                                    ]
                                                },
                                            },
                                            {
                                                header: "Step 2",
                                                id: "uploadParentDZ",
                                                height: 260,
                                                disabled: true,
                                                collapsed: true,
                                                body: {
                                                    id: "uploadParent",
                                                    template: '<form action="ajax/upload/uploadParent.php" class="dropzone" id="uploadParent"><div class="dz-message" data-dz-message><span>Upload Zip file</span></div></form>',
                                                    gravity: 1,
                                                    minHeight: 220,
                                                }
                                            },
                                            {
                                                header: "Step 3",
                                                id: "editChildrenCont",
                                                collapsed: true,
                                                disabled: true,
                                                body: {
                                                    view: "form",
                                                    elements: [
                                                        {
                                                            view: "button",
                                                            id: "editChildren",
                                                            value: "Go swap interface",
                                                            disabled: true,
                                                            on: {
                                                                onItemClick: function () {
                                                                    window.location.href = "swap_app.php?series_name=" + btoa(window.newSeriesName);
                                                                }
                                                            }
                                                        }
                                                    ]
                                                }
                                            },
                                            {height: 10, },
                                        ]
                                    },
                                    {gravity: 1},
                                ],
                            },
                        ]
                    },
                ]
            }
        }
        elem.body.rows[1].cells[0].rows[0].cols.push(seriesList);
        elem.body.rows[1].cells[0].rows[0].cols.push(seriesActions);
        webix.ui(elem);
        $(window).resize(resize);
        resize();
    });

})
function setWebixInnerById(id, inner) {
    $($$(id).$view).find("button")[0].innerHTML = inner;
}

function attachDropzoneEvents(seriesName, dzid, callback) {
    console.log(dzid);
    if (!window[dzid + "DropzoneAttached"]) {
        new Dropzone("form#" + dzid, {url: "ajax/upload/uploadParent.php?seriesName=" + seriesName});
        window[dzid + "DropzoneAttached"] = true;
    }
    Dropzone.forElement("#" + dzid).options.url = "ajax/upload/uploadParent.php?seriesName=" + seriesName;
    window.parentDropzone = Dropzone.forElement("#" + dzid);
    window.parentDropzone.on("success", function (file, ret) {
        console.log(ret);
        if (ret.split(":")[0] == "error") {
            webix.message(initCaps(ret));
            this.removeAllFiles();
        } else {
            callback();
        }
    });
    window.parentDropzone.on("error", function (file, ret) {
        console.error(file);
        console.error(ret);
    });
}

function initCaps(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


// nasty bit of work this.
function resize() {
    var height = $(document.body).height();
    $$("actionBody").define("minHeight", Math.max(415, height - 167));
    // Force UI update
    $$("reuploadParentDZ").expand();
    $$("reuploadParentDZ").collapse();
}
