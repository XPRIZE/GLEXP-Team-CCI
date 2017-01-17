/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function ClearDirectory(loc, callback) {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
    function fail(evt) {
	alert("FILE SYSTEM FAILURE" + evt.target.error.code);
    }
    function onFileSystemSuccess(fileSystem) {
	fileSystem.root.getDirectory(
		loc,
		{create: true, exclusive: false},
		function (entry) {
		    entry.removeRecursively(function () {
			console.log(loc + " Removed Recursively Succeeded");
			callback();
		    }, fail);
		}, fail);
    }
}