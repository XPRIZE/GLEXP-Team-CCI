function navHandler() {
    var road = {
        welcome: "exit",
        login: "welcome", // change to index if you ever want that front end bullshit back.
        school: "login",
        subject: "school",
        books: "school"
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
                    window.location.href = window.location.href;
                } else if (road[cur]) {
                    window.location.href = road[cur] + ".html";
                } else {
                    window.location.href = "welcome.html";
                }
            } else {
                console.log("Dublicate nav presses");
            }

        });
    }
}
navHandler();


// Juuust in case we see another viewport tom-fuckery. ALSO, if still a problem in the morning, add an interval function.
function viewportFix() {
    window.setTimeout(function () {
        viewport = document.querySelector("meta[name=viewport]");
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.01, maximum-scale=1.0, user-scalable=0');
        window.setTimeout(function () {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
        }, 1);
    }, 500);
}
