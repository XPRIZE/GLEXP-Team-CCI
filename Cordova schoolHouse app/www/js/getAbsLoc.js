window.schoolLocWritable = "school";
window.schoolLoc = "school";
window.usersLoc = "users";

document.addEventListener("deviceready", function () {
    window.schoolLoc = "";
    if (device.platform == "browser") {
        // browser or phonegap emeulated
        window.schoolLocWritable = "school";
        window.schoolLoc = "school";
        window.usersLoc = "users";
    } else {
        window.schoolLocWritable = "cdvfile://localhost/persistent/content/school";
        window.schoolLoc = "school";
        window.usersLoc = "cdvfile://localhost/persistent/content/users";
    }
}, false);

