window.dev = false;
window.alert = function (msg) {
    if (dev) {
        if (webix) {
            webix.message("Alert: " + msg);
        } else {
            alert("Alert: " + msg);
        }
    }
}
window.onerror = function (message, url, linenumber) {
    if (dev) {
        var script = url.split("/");
        script = script[script.length - 1];
        if (webix) {
            webix.message("Error: " + message + " line: " + linenumber + ", script: " + script);
        } else {
            alert("Error: " + message + " line: " + linenumber + ", script: " + script);
        }
    }
}