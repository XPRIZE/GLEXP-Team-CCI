/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// Not sure where I will use this, but I'm sure I can find a place.

function createFile(name, callback) {
    var type = window.PERSISTENT;
    var size = 5 * 1024 * 1024;
    window.requestFileSystem(type, size, successCallback, errorCallback)
    function successCallback(fs) {
	fs.root.getFile(name, {create: true, exclusive: true}, function (fileEntry) {
	    // console.log('File creation successfull!');
	    callback();
	}, errorCallback);
    }
    function errorCallback(error) {
	if (error.code == 13) {
	    clearFile(name, function () {
		callback();
	    });
	} else {
	    // console.error("ERROR: " + error.code);
	    callback();
	}
    }
}
function clearFile(fileName, callback) {
    var callback = callback;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
	fileSystem.root.getFile(fileName, {create: false}, function (fileEntry) {
	    fileEntry.createWriter(function (writer) {
		writer.onwriteend = function (evt) {
		    callback();
		}
		writer.truncate(0);
	    }, function () {
		callback();
	    });
	}, function () {
	    callback();
	});
    }, function () {
	console.log("Error: Getting file system failed");
    });
}
function writeFile(name, what, callback) {
    var type = window.PERSISTENT;
    var size = 5 * 1024 * 1024;
    window.requestFileSystem(type, size, successCallback, errorCallback)
    function successCallback(fs) {
	fs.root.getFile(name, {create: true}, function (fileEntry) {
	    fileEntry.createWriter(function (fileWriter) {
		fileWriter.onwriteend = function (e) {
		    // console.log('Write completed.');
		    callback();
		};
		fileWriter.onerror = function (e) {
		    console.error('Write failed: ' + e.toString());
		};
		var blob = new Blob([what], {type: 'text/plain'});
		fileWriter.write(blob);
	    }, errorCallback);
	}, errorCallback);
    }
    function errorCallback(error) {
	console.error("ERROR: " + error.code);
	callback();
    }
}
function readFile(name, callback) {
    if (device.platform == "browser") {
	$.get(name, function (data) {
	    if (name.split(".")[1] == "xml") {
		var str = new XMLSerializer().serializeToString(data);
		callback(str);
	    } else {
		callback(data);
	    }
	}).fail(function () {
	    callback(false);
	});
    } else {
	var type = window.PERSISTENT;
	var size = 5 * 1024 * 1024;
	window.requestFileSystem(type, size, successCallback, errorCallback)
	function successCallback(fs) {
	    fs.root.getFile(name, {}, function (fileEntry) {
		fileEntry.file(function (file) {
		    var reader = new FileReader();
		    reader.onloadend = function (e) {
			callback(this.result);
		    };
		    reader.readAsText(file);
		}, errorCallback);
	    }, errorCallback);
	}

	function errorCallback(error) {
	    // console.error("ERROR: " + error.code);
	    callback(false);
	}
    }
}
function deleteFile(name, callback) {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
	fileSystem.root.getFile(name, {create: false}, function (fileEntry) {
	    fileEntry.remove(function (file) {
		callback("File removed!");
	    }, function () {
		console.log("error deleting the file " + error.code);
		callback();
	    });
	}, function () {
	    console.log("file does not exist");
	    callback();
	});
    }, function (evt) {
	console.log(evt.target.error.code);
	callback();
    });
}
function overwriteFile(fileName, what, callback) {
    clearFile(fileName, function () {
	writeFile(fileName, what, function () {
	    callback();
	})
    })
}
function checkDirectory(folderPath, callback) {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
	fileSystem.root.getDirectory(folderPath, {create: false}, function () {
	    callback(false);
	}, function () {
	    callback(true);
	});
    });
}

document.addEventListener("deviceready", function () {
    /*
     createFile("log.txt", function () {
     writeFile("log.txt", "aa", function () {
     readFile("log.txt", function (ret) {
     // console.log(ret);
     });
     });
     });
     */
});