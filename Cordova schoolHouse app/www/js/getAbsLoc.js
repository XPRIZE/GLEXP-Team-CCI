/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


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

