$(document).ready(function () {
    // TODO: Move all folder and book db calls to serverside... These should be echoed into the main page and referenced once from global scope.
    $.ajax({
        type: 'get',
        url: 'ajax/get/getBooks.php',
        success: function (ret) {
            if (ret.substring(0, 6) == "<br />") {
                document.body.innerHTML = ret;
            } else {
                let bookData = window.eval(ret);

                let folders = [];
                bookData.map(s => {
                    if (folders.indexOf(s.folder) === -1) {
                        folders.push(s.folder);
                    }
                });
                let i = 0;
                let treeData = folders.map(f => {
                    i++;
                    let ret = {
                        id: "0." + i,
                        open: false,
                        folder: f,
                        data: []
                    };
                    let ii = 0;
                    bookData.map(s => {
                        ii++;
                        s.folder = (typeof s.folder == "undefined") ? "" : s.folder;
                        if (s.folder === f) {
                            let d = {
                                id: s.ID,
                                value: s.name,
                            };
                            ret.data.push(d);
                        }
                    });
                    ret.value = f;
                    return ret;
                });
                // Sort folders alpha
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
                console.log(treeData);
                ready(treeData, folders);
            }
        }
    });
    // Webix functions split from main webix.ui() chunk, for decent screen left spacing

    function wb_bookList_beforeDrop(context) {
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
            console.log("Set " + seriesID + " to .folder" + folderName);
            context.parent = pid;
            $.ajax({
                type: 'get',
                url: 'ajax/set/setBooksFolder.php',
                data: { "bookID": seriesID, "folderName": folderName },
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
    }
    function wb_bookList_afterDrop(context) {
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
            data: { "orderByID": JSON.stringify(orderByID) },
            success: function (ret) {
                if (ret == "done") {
                    // window.location.href = window.location.href;
                    // webix.message("Order updated");
                } else {
                    window.alert(ret + "</br>Please contact support");
                    document.body.innerHTML = ret;
                }
            }
        })
    }
    function wb_bookList_click(id) {
        var obj = this.getItem(id);
        if (typeof obj.folder !== "undefined") {
            obj.open = !obj.open;
            $$("bookList").refresh();
            return false;
        } else {
            var unitName = this.getItem(id).value;
            window.selectedBook = unitName;
            window.selectedBookID = this.getItem(id).id;
            $$("deleteBook").enable();
            $$("viewBookOld").enable();
            $$("viewBookNew").enable();
            $$("reuploadBook").enable();
            $$('reuploadBook').data.upload = "ajax/upload/uploadBook.php?bookName=" + window.selectedBook;
            $$("downloadBook").enable();
            $$("renameBook").enable();
        }

    };
    function wb_newFolder_click() {
        let folderName = prompt("Enter a new folder name. (Note, it will not save until you put a series in it");
        if (folderName) {
            let found = false;
            let pull = $$("bookList").data.pull;
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
                $$("bookList").data.add({
                    id: fc,
                    open: true,
                    folder: folderName,
                    value: folderName
                });
            }
        }
    }
    function wb_downloadBook_click() {
        var url = "ajax/download/prepBookDownload.php?id=" + selectedBookID + "&name=" + window.selectedBook;
        $$("downloadBook").setValue("Preparing download");
        $$("downloadBook").disable();
        $$("downloadBook").refresh();
        $.ajax(url)
            .done(function (ret) {
                $$("downloadBook").setValue("Done!");
                $$("downloadBook").refresh();
                if (ret == "done") {
                    window.location.href = "books/" + window.selectedBookID + "/" + window.selectedBook + ".zip";
                } else {
                    console.log(ret);
                }
                window.setTimeout(function () {
                    $$("downloadBook").setValue("Download");
                    $$("downloadBook").enable();
                    $$("downloadBook").refresh();
                }, 500)

            })
            .fail(function () {
                webix.message("error: Bad ajax call");
            })
    }
    function wb_renameBook_click() {
        let newName = window.prompt("New name please: ");
        $.ajax("ajax/rename/renameBook.php?name=" + newName + "&id=" + window.selectedBookID + "&oldname=" + window.selectedBook).done(
            function (ret) {
                if (ret == "done") {
                    webix.message("Done.");
                    window.location.href = window.location.href
                } else if (ret == "taken") {
                    var sel = THIS.getSelectedId();
                    var row = THIS.getItem(sel.row);
                    row.name = state.old;
                    THIS.updateItem(sel.row, row);
                    THIS.refresh();
                    webix.message("Name already taken! Rename to something else.");
                } else {
                    document.body.innerHTML = ret;
                }
            }
        );
    }
    function wb_newBookName_keyPress() {
        var requestName = $$("newBookName").getValue();
        if (requestName) {
            if (window.newBookTimeout) {
                window.clearTimeout(newBookTimeout);
            }
            $$("newBook").disable();
            $$("newBook").setValue("Checking...");
            $$("newBook").refresh();
            window.newBookTimeout = window.setTimeout(function () {
                var jqxhr = $.ajax("ajax/check/checkBookName.php?name=" + requestName)
                    .done(function (ret) {
                        if (ret == "") {
                            $$("newBook").enable();
                            $$("newBook").setValue("Create");
                            $$("newBook").refresh();
                        } else {
                            $$("newBook").disable();
                            $$("newBook").setValue("Name taken");
                            $$("newBook").refresh();
                        }
                    })
                    .fail(function () {
                        alert("error");
                    })
            }, 500);
        } else {
            $$("newBook").disable();
            $$("newBook").setValue("Enter a name");
            $$("newBook").refresh();
        }
    }
    function wb_newBook_click() {
        $$("newBookName").disable();
        $$(this).disable();
        $$(this).setValue("Please wait...");
        $$(this).refresh();
        var requestName = $$("newBookName").getValue();
        var requestedFolder = $$("newSeriesFolderName").getValue();
        if (requestName) {
            // Check one last time, just to be safe and stuff and things and
            $.ajax("ajax/check/checkBookName.php?name=" + requestName).done(function (ret) {
                if (ret == "") {
                    $.ajax("ajax/new/newBook.php?name=" + requestName + "&folder=" + requestedFolder).done(function (ret) {
                        if (ret == "true" || ret == 1) {
                            window.newBookName = requestName;
                            $$('uploadBookCont').enable();
                            $$('uploadBookCont').expand();
                            $$("newBook").disable();
                            $$("newBook").setValue("Upload book");
                            $$("newBook").refresh();
                            $$('uploadBookCont').enable();
                            $$('uploadBookCont').expand();
                            $$('uploadBook').enable();
                            $$('uploadBook').data.upload = "ajax/upload/uploadBook.php?bookName=" + requestName;

                        } else {
                            console.error(ret);
                        }
                    });
                } else {
                    $$("newBook").disable();
                    $$("newBook").setValue("Name taken");
                    $$("newBook").refresh();
                    $$("newBookName").enable();
                }
            });
        } else {
            $$(this).enable();
            $$(this).setValue("Enter a name");
            $$("newBookName").enable();
        }
    }

    // Webix.ui function here... Unfortunately since data is ajaxed in, not echoed, the call is behind this function, with the two args getting generated from the top $.ajax call
    function ready(treeData, folders) {
        webix.ui({
            view: "scrollview",
            body: {
                type: "space",
                rows: [
                    // Header
                    {
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
                                view: "label",
                                template: "<p class='toolbarCenterLabel'>Static Exports</p>"
                            },
                            {
                                view: "button", value: "Logout", width: 80, on: {
                                    onItemClick: function () {
                                        window.location.href = "logout.php";
                                    }
                                }
                            }
                        ]
                    },
                    // Existing books
                    {
                        header: "Select Export",
                        id: "selectBook",
                        collapsed: false,
                        body: {
                            cols: [
                                {
                                    id: "bookList",
                                    view: "tree",
                                    select: true,
                                    drag: true,
                                    autoheight: true,
                                    scroll: "y",
                                    data: treeData,
                                    columns: [
                                        { id: "ID", header: "", width: 50, },
                                        { id: "name", header: "Name", width: 200, editor: "text", },
                                        { id: "pages", header: "Pages", width: 100, editor: false, },
                                        { id: "longname", header: "Long Name", fillspace: true, editor: "text", },
                                    ],
                                    on: {
                                        onBeforeDrop: wb_bookList_beforeDrop,
                                        onAfterDrop: wb_bookList_afterDrop,
                                        onItemClick: wb_bookList_click
                                    }
                                },
                                {
                                    rows: [
                                        {},
                                        {
                                            value: "New folder", view: "button", on: {
                                                onItemClick: wb_newFolder_click
                                            }
                                        },
                                        {
                                            value: "New static export", view: "button", on: {
                                                onItemClick: function () {
                                                    $$("newBookCont").expand();
                                                    $$("selectBook").collapse();
                                                }
                                            }
                                        },
                                        {},

                                        {
                                            value: "View old", id: "viewBookOld", view: "button", disabled: true, on: {
                                                onItemClick: function () {
                                                    window.location.href = "read.php?t=b&id=" + window.selectedBookID;
                                                }
                                            }
                                        },
                                        {
                                            value: "View new", id: "viewBookNew", view: "button", disabled: true, on: {
                                                onItemClick: function () {
                                                    window.location.href = "read.php?engineCode=new&t=b&id=" + window.selectedBookID;
                                                }
                                            }
                                        },

                                        {},
                                        {
                                            view: "button",
                                            id: "downloadBook",
                                            disabled: true,
                                            width: 150,
                                            value: "Download",
                                            on: {
                                                onItemClick: wb_downloadBook_click
                                            },
                                        },
                                        {
                                            view: "uploader",
                                            id: "reuploadBook",
                                            disabled: true,
                                            view: "uploader",
                                            width: 150,
                                            value: "Reupload",
                                            upload: "ajax/upload/uploadBook.php",
                                            on: {
                                                onUploadComplete: function () {
                                                    webix.message("Upload complete!");
                                                    window.location.href = window.location.href;
                                                },
                                                onFileUploadError: function (file, err) {
                                                    console.alert(err);
                                                },
                                                onFileUpload: function () {
                                                    console.log("here");
                                                }
                                            },
                                        },
                                        {},
                                        {
                                            value: "Rename", id: "renameBook", view: "button", disabled: true, on: {
                                                onItemClick: wb_renameBook_click,
                                            },
                                        },
                                        {
                                            value: "Delete", id: "deleteBook", view: "button", css: "delete", disabled: true, on: {
                                                onItemClick: function () {
                                                    var url = "ajax/delete/deleteBook.php?bookName=" + window.selectedBook;
                                                    deletePrompt(window.selectedBook, "export", url, false)
                                                }
                                            }
                                        },
                                        {},
                                    ],
                                },
                            ],
                        },
                    },
                    // Upload UI for new books
                    {
                        header: "New Export",
                        id: "newBookCont",
                        collapsed: true,
                        body: {
                            rows: [
                                {
                                    id: "createTab",
                                    header: "New Book",
                                    cols: [
                                        { gravity: 1 },
                                        {
                                            gravity: 5,
                                            maxWidth: 400,
                                            autoheight: true,
                                            rows: [
                                                { height: 10, },
                                                {
                                                    header: "Name", collapsed: false, body: {
                                                        view: "form",
                                                        gravity: 1,
                                                        elements: [
                                                            {
                                                                view: "text", label: "Name: ", id: "newBookName", labelWidth: 150, on: {
                                                                    onTimedKeyPress: wb_newBookName_keyPress,
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
                                                                view: "button", id: "newBook", value: "Enter a name", disabled: true, on: {
                                                                    onItemClick: wb_newBook_click,
                                                                }
                                                            },
                                                        ]
                                                    },
                                                },
                                                {
                                                    header: "Upload",
                                                    id: "uploadBookCont",
                                                    height: 260,
                                                    disabled: false,
                                                    collapsed: false,
                                                    body: {
                                                        view: "form",
                                                        rows: [
                                                            {
                                                                view: "uploader",
                                                                id: "uploadBook",
                                                                disabled: true,
                                                                view: "uploader",
                                                                width: 200,
                                                                value: "Upload zip",
                                                                upload: "ajax/upload/uploadBook.php",
                                                                on: {
                                                                    onUploadComplete: function () {
                                                                        webix.message("Upload complete!");
                                                                        window.location.href = window.location.href;
                                                                    }
                                                                },
                                                            },
                                                            {
                                                                view: "list", id: "mylist", type: "uploader", autoheight: true, borderless: true,
                                                            },

                                                        ]
                                                    }
                                                },
                                            ]
                                        },
                                        { gravity: 1 },
                                    ],
                                },
                            ]
                        }
                    }
                ]
            }
        });
    }
})