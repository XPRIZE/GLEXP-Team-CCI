/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function getValByTag(node, tag) {
    if (node && node.getElementsByTagName(tag).length && node.getElementsByTagName(tag)[0].innerHTML) {
	return node.getElementsByTagName(tag)[0].innerHTML;
    } else {
	return false;
    }
}


document.addEventListener("deviceready", function () {
    readFile("users.xml", function (xml) {
	if (xml === false) {
	    createFile("users.xml", function () {
		writeFile("users.xml", "<users></users>", function () {
		    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onRequestFileSystemSuccess, null);
		    function onRequestFileSystemSuccess(fileSystem) {
			var entry = fileSystem.root;
			entry.getDirectory("users", {create: true, exclusive: false}, onGetDirectorySuccess, onGetDirectoryFail);
		    }
		    function onGetDirectorySuccess(dir) {
			// console.log("Created dir " + dir.name);
		    }
		    function onGetDirectoryFail(error) {
			console.log("Error creating directory " + error.code);
		    }
		    parseXML("<users></users>");
		});
	    });
	} else {
	    parseXML(xml);
	}
    });
    $.ajax({
	type: "GET",
	url: schoolLoc + "/school.xml", // not modified, who cares, just getting bg image
	dataType: "xml",
	success: function (xml) {
	    window.schoolXML = xml;
	    var bgSrc = getValByTag(xml, "schoolBG");
	    if (bgSrc) {
		$("<style type='text/css'> .schoolBG{ background-image: url(" + window.schoolLoc + "/icons/" + bgSrc + ");} </style>").appendTo("head");
	    }
	    var avatar = getValByTag(xml, "avatar");
	    if (avatar) {
		window.avatarSrc = window.schoolLoc + "/icons/" + avatar;
		if ($("#defaultAvatar")) {
		    $("#defaultAvatar").attr("src", window.avatarSrc);
		}
	    }

	    var initTutorial = "";
	    var tuts = schoolXML.getElementsByTagName("tutorial");
	    for (var t = 0; t < tuts.length; t++) {
		var tut = tuts[t];
		if (getValByTag(tuts[t], "type") == "app") {
		    initTutorial = getValByTag(tuts[t], "name");
		}
	    }
	},
	error: function () {
	    console.error("School xml did not load");
	}
    });
    function parseXML(xml) {
	var userList = [];
	xml = $.parseXML(xml);
	window.xml = xml;
	if (xml.getElementsByTagName) {
	    var users = xml.getElementsByTagName("user");
	    for (var u = 0; u < users.length; u++) {
		var curXML = users[u];
		var curUser = {};
		curUser.id = getValByTag(curXML, "id");
		curUser.name = getValByTag(curXML, "name");
		curUser.level = getValByTag(curXML, "level");
		// curUser.picture = curUser.id + "_cover_.jpg";
		curUser.picture = getValByTag(curXML, "picture");
		userList.push(curUser);
	    }
	}
	buildUserPage(userList);
    }
    function addUser() {
	var users = xml.getElementsByTagName("user");
	var maxID = 0;
	for (var u = 0; u < users.length; u++) {
	    var curID = getValByTag(users[u], "id");
	    maxID = Math.max(curID, maxID);
	}
	var newID = maxID + 1;
	var cam = new QuickCamera();
	var picName = "profile_pic";
	cam.snap("users/" + newID, picName, function (url) {
	    var user = xml.createElement("user");
	    var id = xml.createElement("id");
	    id.innerHTML = newID;
	    user.appendChild(id);
	    var uName = xml.createElement("name");
	    uName.innerHTML = "";
	    user.appendChild(uName);
	    var picture = xml.createElement("picture");
	    picture.innerHTML = url;
	    user.appendChild(picture);
	    var level = xml.createElement("level");
	    level.innerHTML = 1;
	    user.appendChild(level);
	    xml.getElementsByTagName("users")[0].appendChild(user);
	    var xmlText = new XMLSerializer().serializeToString(xml);
	    overwriteFile("users.xml", xmlText, function (ret) {
		createFile("users/" + newID + "/school.xml", function () {
		    var xmlText = new XMLSerializer().serializeToString(window.schoolXML);
		    writeFile("users/" + newID + "/school.xml", xmlText, function () {
			login(id);
		    })
		});
	    })
	})
    }

    function login(id) {
	overwriteFile("loggedIn.txt", id, function (ret) {
	    window.location.href = "school.html";
	})
    }

    function buildUserPage(userList) {
	var users = [];
	function userObj(user) {
	    var ret = "";
	    var avatarID = "";
	    if (!user) {
		user = {};
		user.name = "new";
		user.picture = window.avatarSrc;
		avatarID = "defaultAvatar";
		user.level = "0";
		user.id = "0";
	    }
	    if (user.picture == "default") {
		user.picture = "img/defaultAvatar.png";
	    }
	    ret = {id: "userBlock_" + user.id, css: "userBlock", rows: []};
	    ret.rows.push({maxHeight: 125, template: "<div class=center><span class=middle></span><img id='" + avatarID + "' src='" + user.picture + "' /></div>"});
	    var curLevel = user.level.split(".")[0];
	    var nextPercent = user.level.split(".")[1];
	    if (isNaN(nextPercent)) {
		nextPercent = "0";
	    }
	    var userStats = "";
	    // userStats += "<h4 class='userName'>" + user.name + "</h4>";
	    if (curLevel !== "0") {
		userStats += "<div class='level' level='" + user.level + "'>";
		if (user.level !== "0") {
		    userStats += "<div class='percentToNext' style='width:" + nextPercent + "%;'></div>";
		}
		userStats += "</div>";
		userStats += "<h4 class='levelAt'>" + curLevel + "</h4>";
	    }

	    ret.rows.push({height: 35, maxWidth: 200, template: userStats, css: "stat"});
	    return ret;
	}
	for (var u = 0; u < userList.length; u++) {
	    users.push(userObj(userList[u]));
	    users.push({width: 10});
	}
	if (userList.length < 5) {
	    users.push(userObj());
	}
	webix.ui({
	    css: "schoolBG",
	    rows: [
		{gravity: 0.2},
		{cols: [
			{gravity: 0.2},
			{
			    cols: users,
			},
			{gravity: 0.2},
		    ]},
		{gravity: 0.2},
	    ]
	});
	$('.userBlock').click(function () {
	    var id = $(this).attr("view_id").split("_")[1];
	    if (id == "0") {
		addUser();
	    } else {
		login(id);
	    }

	});
    }
}
);
