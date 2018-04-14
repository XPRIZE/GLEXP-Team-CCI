function output(what, type) {
    $("#outputLog").append("<br><span>" + what + "</span>");
    $("#outputLog")[0].scrollTop = $("#outputLog")[0].scrollHeight;
}

function startDownload(schoolName) {
    webix.ui({
	view: "window",
	id: "downloadWindow",
	head: "Loading",
	position: "center",
	body: {
	    id: "downloadWindowBody",
	    template: "<div id=outputLog>Initializing..."
	}
    }).show();
    window.schoolName = schoolName;
    downloadSchool(function () {
	unzipSchool();
    });
}

function unzipSchool() {
    var that = this,
	    App = new DownloadApp(),
	    fileName = window.schoolName + ".zip",
	    folderName = "content";
    output("Unzipping " + folderName + "/" + fileName, "log");
    App.unzip(folderName, fileName,
	    function () {
		output("Unzipped and assigned", "log");
	    },
	    function (error) {
		output("Unzip failed: " + error.message, "error");
	    }
    );
}

var totMessages = 0;
function downloadSchool(complete) {
    var that = this,
	    App = new DownloadApp(),
	    fileName = window.schoolName + ".zip",
	    uri = encodeURI("http://52.21.126.241/schools/" + window.schoolName + ".zip"),
	    folderName = "content";
    output("Downloading school zip", "log");
    App.load(uri, folderName, fileName,
	    function (percentage) {
		totMessages++;
		output(percentage + "% -- " + totMessages, "log");
	    },
	    function (entry) {
		var url = entry.toURL();
		output("Complete. Saved to " + url, "log");
		complete();
	    },
	    function () {
		output("Failed. URL: " + that.uri, "error");
	    }
    );
}

var DownloadApp = function () {
}

DownloadApp.prototype = {
    load: function (uri, folderName, fileName, progress, success, fail) {
	var that = this;
	that.progress = progress;
	that.success = success;
	that.fail = fail;
	filePath = "";
	that.getFilesystem(
		function (fileSystem) {
		    output("Got file system.", "log");
		    that.getFolder(fileSystem, folderName, function (folder) {
			filePath = folder.toURL() + "/" + fileName;
			that.transferFile(uri, filePath, progress, success, fail);
		    }, function (error) {
			output("Failed to get folder: " + error.code, "error");
			typeof that.fail === 'function' && that.fail(error);
		    });
		},
		function (error) {
		    output("Failed to get filesystem: " + error.code, "error");
		    typeof that.fail === 'function' && that.fail(error);
		}
	);
    },
    getFilesystem: function (success, fail) {
	window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, success, fail);
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
		    output("File saved to: " + url, "log");
		    typeof that.success === 'function' && that.success(entry);
		},
		function (error) {
		    output("An error has occurred: Code = " + error.code, "error");
		    output("download error source " + error.source, "error");
		    output("download error target " + error.target, "error");
		    output("download error code " + error.code, "error");
		    typeof that.fail === 'function' && that.fail(error);
		}
	);
    },
    unzip: function (folderName, fileName, success, fail) {
	var that = this;
	function output(what, type) {
	    $("#outputLog").append("<br><span>" + what + "</span>");
	    $("#outputLog")[0].scrollTop = $("#outputLog")[0].scrollHeight;
	}

	function startDownload(schoolName) {
	    webix.ui({
		view: "window",
		id: "downloadWindow",
		head: "Loading",
		position: "center",
		body: {
		    id: "downloadWindowBody",
		    template: "<div id=outputLog>Initializing..."
		}
	    }).show();
	    window.schoolName = schoolName;
	    downloadSchool(function () {
		unzipSchool();
	    });
	}

	function unzipSchool() {
	    var that = this,
		    App = new DownloadApp(),
		    fileName = window.schoolName + ".zip",
		    folderName = "content";
	    output("Unzipping " + folderName + "/" + fileName, "log");
	    App.unzip(folderName, fileName,
		    function () {
			output("Unzipped and assigned", "log");
		    },
		    function (error) {
			output("Unzip failed: " + error.message, "error");
		    }
	    );
	}

	var totMessages = 0;
	function downloadSchool(complete) {
	    var that = this,
		    App = new DownloadApp(),
		    fileName = window.schoolName + ".zip",
		    uri = encodeURI("http://52.21.126.241/schools/" + window.schoolName + ".zip"),
		    folderName = "content";
	    output("Downloading school zip", "log");
	    App.load(uri, folderName, fileName,
		    function (percentage) {
			totMessages++;
			output(percentage + "% -- " + totMessages, "log");
		    },
		    function (entry) {
			var url = entry.toURL();
			output("Complete. Saved to " + url, "log");
			complete();
		    },
		    function () {
			output("Failed. URL: " + that.uri, "error");
		    }
	    );
	}

	var DownloadApp = function () {
	}

	DownloadApp.prototype = {
	    load: function (uri, folderName, fileName, progress, success, fail) {
		var that = this;
		that.progress = progress;
		that.success = success;
		that.fail = fail;
		filePath = "";
		that.getFilesystem(
			function (fileSystem) {
			    output("Got file system.", "log");
			    that.getFolder(fileSystem, folderName, function (folder) {
				filePath = folder.toURL() + "/" + fileName;
				that.transferFile(uri, filePath, progress, success, fail);
			    }, function (error) {
				output("Failed to get folder: " + error.code, "error");
				typeof that.fail === 'function' && that.fail(error);
			    });
			},
			function (error) {
			    output("Failed to get filesystem: " + error.code, "error");
			    typeof that.fail === 'function' && that.fail(error);
			}
		);
	    },
	    getFilesystem: function (success, fail) {
		window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, success, fail);
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
			    output("File saved to: " + url, "log");
			    typeof that.success === 'function' && that.success(entry);
			},
			function (error) {
			    output("An error has occurred: Code = " + error.code, "error");
			    output("download error source " + error.source, "error");
			    output("download error target " + error.target, "error");
			    output("download error code " + error.code, "error");
			    typeof that.fail === 'function' && that.fail(error);
			}
		);
	    },
	    unzip: function (folderName, fileName, success, fail) {
		var that = this;
		that.success = success;
		that.fail = fail;
		output("Zip.unzip(" + "cdvfile://localhost/persistent/" + folderName + "/" + fileName + "," + "cdvfile://localhost/persistent/" + folderName);
		zip.unzip("cdvfile://localhost/persistent/" + folderName + "/" + fileName,
			"cdvfile://localhost/persistent/" + folderName,
			function (code) {
			    output(code);
			    if (code == 0) {
				output("Success");
				window.setTimeout(function () {
				    window.location.href = "index.html";
				}, 750);
			    }
			}
		);
	    }
	}

	that.success = success;
	that.fail = fail;
	output("Zip.unzip(" + "cdvfile://localhost/persistent/" + folderName + "/" + fileName + "," + "cdvfile://localhost/persistent/" + folderName);
	zip.unzip("cdvfile://localhost/persistent/" + folderName + "/" + fileName,
		"cdvfile://localhost/persistent/" + folderName,
		function (code) {
		    output(code);
		    if (code == 0) {
			output("Success");
			window.setTimeout(function () {
			    window.location.href = "index.html";
			}, 750);
		    }
		}
	);
    }
}
