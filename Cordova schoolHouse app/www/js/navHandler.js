window.navPressed = false;
function navHandler() {
    var road = {
	welcome: "exit",
	login: "welcome", // change to index if you ever want that front end bullshit back.
	school: "login",
	subject: "school",
    };
    if (window.history && window.history.pushState) {
	window.addEventListener("popstate", function (e) {
	    e.preventDefault();
	    if (!window.navPressed) { // not working
		window.navPressed = true;
		var loc = window.location.href.split("/");
		var cur = loc.pop();
		cur = cur.split(".")[0];
		if (road[cur] == "exit") {
		    if (navigator.app) {
			// navigator.app.exitApp();
			window.location.href = window.location.href;
		    } else if (navigator.device) {
			// navigator.device.exitApp();
			window.location.href = window.location.href;
		    } else {
			window.close();
		    }
		} else if (road[cur]) {
		    window.location.href = road[cur] + ".html";
		} else {
		    window.location.href = "welcome.html";
		}
	    } else {
		console.log("Dpublicate nav presses");
	    }

	});
    }
}
navHandler();
