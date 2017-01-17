/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


console.log = function (msg) {
    if (webix) {
	webix.message("Log: " + msg);
    } else {
	alert("Log: " + msg);
    }
}

window.onerror = function (message, url, linenumber) {
    var script = url.split("/");
    script = script[script.length - 1];
    if (webix) {
	webix.message("Error: " + message + " line: " + linenumber + ", script: " + script);
    } else {
	alert("Error: " + message + " line: " + linenumber + ", script: " + script);
    }
}