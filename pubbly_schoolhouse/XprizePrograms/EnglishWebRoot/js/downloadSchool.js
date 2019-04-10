
/*function output(what, type) {
 if ($("#outputLog")[0]) {
 $("#outputLog").append("<br><span>" + what + "</span>");
 $("#outputLog")[0].scrollTop = $("#outputLog")[0].scrollHeight;
 } else {
 console.log(what);
 }
 
 }
 */

function startDownload(name, size, downloadType) {
    window.schoolName = name;
    var schoolSize = size;
    downloadSchool(name, size, downloadType, function () {
        if (confirm("Download complete!")) {
            window.location.href = window.location.href;
        } else {
        }
    });
}
/*
 function showDownloadWindow() {
 webix.ui({
 view: "window",
 id: "downloadWindow",
 position: "center",
 head: {
 view: "toolbar", margin: -4, cols: [
 {view: "label", label: "Downloading from server"},
 {view: "icon", icon: "times-circle",
 click: "$$('downloadWindow').hide();"}
 ]
 },
 body: {
 id: "downloadWindowBody",
 template: "<div id=outputLog style='height:600px;overflow-y:scroll;'>Initializing...",
 height: 605,
 width: 1200,
 }
 }).show();
 }
 */

var totMessages = 0;
function downloadSchool(schoolName, size, downloadType, complete) {
    size = Math.round(size);
    window.requestFileSystem(LocalFileSystem.PERSISTENT, size, function (fileSystem) {
        var entry = fileSystem.root;
        entry.getDirectory("school", {create: true, exclusive: false}, function () {
            //output("School root created clean, getting manifest");
            // window.schoolName = SmallTestSchool_zip
            $.get("http://52.21.126.241/downloads/" + schoolName + "_zip/manifest.xml?" + Math.round(Math.random() * 1000), function (data) {
                var files = data.getElementsByTagName("file");
                var f = 0;
                var next = function () {
                    if (files[f]) {
                        var node = files[f];
                        var fileName = node.getElementsByTagName("name")[0].innerHTML;
                        var fileSize = node.getElementsByTagName("size")[0].innerHTML;
                        if (downloadType == "partial" && (fileName !== "schoolStructure" && fileName !== "bookIncludes")) {
                            // output("Partial download, skipping " + fileName);
                            f++;
                            next();
                            // don't download
                        } else {
                            downloadAndUnzip(schoolName + "_zip/" + fileName + ".zip", fileSize, function () {
                                f++;
                                next();
                            });
                        }
                    } else {
                        complete();
                    }
                }
                next();
            });
        }, function (ret) {
            console.log("Couldn't make school folder");
            console.log(ret);
        });
    }, null);
}
function downloadAndUnzip(partialServerLoc, size, callback) {
    var production = true;
    if (production) {
        alert("Error: Pubbly not found on device");
    } else {
        window.progress = ProgressPopup();
        var that = this;
        var File = new DownloadFile();
        // var fileName = window.schoolName + ".zip";
        var schoolName = partialServerLoc.split("/")[0];
        var fileName = partialServerLoc.split("/")[1];
        // var uri = encodeURI("http://52.21.126.241/schools/schoolStructure.zip");
        var uri = encodeURI("http://52.21.126.241/downloads/" + partialServerLoc);
        var folderName = "content";

        //output("Downloading " + fileName, "log");
        File.load(uri, folderName, fileName, size,
                function (percentage) {
                    totMessages++;
                    // output(percentage + "% -- " + totMessages, "log");
                    window.progress.update(percentage);
                },
                function (entry) {
                    var url = entry.toURL();
                    // output("Complete. Saved to " + url, "log");
                    window.progress.close();
                    delete window.progress;
                    File.unzip(folderName, fileName, function () {
                        callback();
                    }, function () {
                        console.log("Error unzipping");
                    })
                },
                function () {
                    console.error("Failed. URL: " + that.uri, "error");
                }
        );
    }
}



var DownloadFile = function () {
}

DownloadFile.prototype = {
    load: function (uri, folderName, fileName, fileSize, progress, success, fail) {
        var that = this;
        that.progress = progress;
        that.success = success;
        that.fail = fail;
        filePath = "";
        that.getFilesystem(
                fileSize,
                function (fileSystem) {
                    // output("Got file system.", "log");
                    that.getFolder(fileSystem, folderName, function (folder) {
                        // output("Allocated " + fileSize + " bytes for zip");
                        filePath = folder.toURL() + "/" + fileName;
                        that.transferFile(uri, filePath, progress, success, fail);
                    }, function (error) {
                        // output("Failed to get folder: " + error.code, "error");
                        typeof that.fail === 'function' && that.fail(error);
                    });
                },
                function (error) {
                    // output("Failed to get filesystem: " + error.code, "error");
                    typeof that.fail === 'function' && that.fail(error);
                }
        );
    },
    getFilesystem: function (fileSize, success, fail) {
        fileSize = Math.round(fileSize);
        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, fileSize, success, fail);
    },
    getFolder: function (fileSystem, folderName, success, fail) {
        fileSystem.root.getDirectory(folderName, {create: true, exclusive: false}, success, fail)
    },
    transferFile: function (uri, filePath, progress, success, fail) {
        var that = this;
        that.progress = progress;
        that.success = success;
        that.fail = fail;
        var transfer = new FileTransfer();
        transfer.onprogress = function (progressEvent) {
            if (progressEvent.lengthComputable) {
                var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                typeof that.progress === 'function' && that.progress(perc); // progression on scale 0..100 (percentage) as number
            } else {
            }
        };
        transfer.download(
                uri,
                filePath,
                function (entry) {
                    var url = entry.toURL();
                    // output("File saved to: " + url, "log");
                    typeof that.success === 'function' && that.success(entry);
                },
                function (error) {
                    console.error("An error has occurred: Code = " + error.code, "error");
                    console.error("download error source " + error.source, "error");
                    console.error("download error target " + error.target, "error");
                    console.error("download error code " + error.code, "error");
                    typeof that.fail === 'function' && that.fail(error);
                }
        );
    },
    unzip: function (folderName, fileName, success, fail) {
        // output("Zip.unzip(" + "cdvfile://localhost/persistent/" + folderName + "/" + fileName + "," + "cdvfile://localhost/persistent/" + folderName + "/school");
        zip.unzip("cdvfile://localhost/persistent/" + folderName + "/" + fileName,
                "cdvfile://localhost/persistent/" + folderName + "/school",
                function (code) {
                    if (code == 0) {
                        // output("Success");
                        success();
                    } else {
                        // output("Error: " + code);
                        fail();
                    }

                }
        );
    }
}

ProgressPopup = function () {
    var THIS = this;
    this.uid = Math.random();
    this.speed = 0;
    this.startStamp = Date.now();
    webix.ui({
        view: "window",
        id: THIS.uid,
        position: "center",
        head: {
            view: "toolbar", margin: -4, cols: [
                {view: "label", label: "Downloading..."},
                {view: "icon", icon: "times-circle",
                    click: "console.log('todo: add cancel action');"}
            ]
        },
        body: {
            id: THIS.uid + "_body",
            template: "<div class=progressBarCont><div class=progressAct></div></div>",
            height: 50,
            width: 200,
        }
    }).show();
    this.progElem = $($$(THIS.uid).$view).find(".progressAct")[0];
    this.update = function (num) {
        $(this.progElem).css("width", num + "%");
    }
    this.close = function () {
        $$(THIS.uid).close();
    }
    return this;
}