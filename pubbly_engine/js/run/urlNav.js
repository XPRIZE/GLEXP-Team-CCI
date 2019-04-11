/*
Originally the GO TO way to link one pubbly to another

Originally just "Go to URL" as a possible target, but hard coding URLs is not a great scalable strategy.

So we came up with "associate" books, and you could link to the associate name, and a bunch of sever side stuff to accomodate that

And then it was "Lets build the school house around it" so you don't have to link to things, but the school house was never a fully automated thing because NY kept changing what they wanted it to look like

And finally the "maps" solution, which is the best so far and the closest we've got to a fully code free put together a thing solution.

But since theyre are too many backward compat URL issues to solve in sequence, I broke all URL navigation targets out into this class.
*/

function UrlNav(environment) {
    _UrlNav = this;
    this.environment = environment;

    // Makes sure there's an http[s]://www. in front of the URL
    this.clean = function (url) {
        let ret;

        if (url.substring(0, 7) == "http://" ||
            url.substring(0, 8) == "https://") {
            // Nothing, perfect
            // ret = ret;
        } else if (url.substring(0, 4) == "www.") {
            // Tag on http, will autocorrect to https if server set
            ret = "http://" + url;
        } else {
            // Just the domain, add everything else.
            ret = "http://www." + url;
        }

        return ret;
    }

    // Ways to open a URL
    this.popup = function (url, error) {
        let popup = window.open(url, '_blank', 'height=page.x,width=page.y');
        if (popup == undefined || !popup) {
            // Popups are blocked
            error("popup");
        } else {
            // Test to make sure the popup really is another window
            window.sameWindowCheck = "test";
            if (popup.sameWindowCheck == "test") {
                error("popup");
            } else {
                // Bring it forwards just incase (screw you livejasmine)
                popup.focus();
                // success();
            }
        }
    }
    this.tab = function (url, error) {
        let tab = window.open(url, '_blank');
        if (tab == undefined || !tab) {
            // Popups are blocked
            error("tab");
        } else {
            // Test to make sure the tab really is another window
            window.sameWindowCheck = "test";
            if (tab.sameWindowCheck == "test") {
                error("tab");
            } else {
                // Bring it forwards just incase (screw you livejasmine)
                tab.focus();
                // success();
            }
        }
    };
    this.window = function (url, error) {
        let rootLoc = window.location.href.split("#")[0];
        let rootUrl = url.split("#")[0];
        if (rootLoc == rootUrl) {
            // Double hash reload, do the fancy
            window.history.pushState("", document.title, window.location.pathname);
        }
        pubbly.reloadCheck = "test";
        window.location.href = url;
        if (rootLoc == rootUrl) {
            window.location.reload();
        }
    };

    // If we tried popup but it didn't work, default to something else.
    let backupOpen = function (from) {
        let map = {
            // Coming from "popup", try "tab" next
            "popup": "tab",
            "tab": "window",
            "window": false,
        }
        let nextAttempt = map[from];
        if (nextAttempt && typeof _UrlNav[nextAttempt] == "function") {
            _UrlNav[nextAttempt].call(_UrlNav, _UrlNav.url, backupOpen);
        } else {
            error("fatal", "UrlNav", "Could not open url " + this.url + " in any way");
        }
    }
    this.previous = function () {
        window.history.go(-1);
        // TODO: If started at index.html, then went index.html#here, then previous...
        // Need to reload. But can't get previous url from history (security)
        // FIX FIX
    }
    this.home = function () {
        // TODO: STAR of the map, but from the map shit
        // TODO: Something to figure out console.pubbly and pubbly and everything
    }

    // Tries preferences first, reverts to backups if errors
    this.go = function (url, preference) {
        if (url.toLowerCase() == "previouswebpage") {
            this.previous();
        } else {
            if (url.toLowerCase() == "homewebpage") {
                this.url = "https://www.pubbly.com";
                let phpVarString = "";
            } else if (url.substring(0, 1) == "#") {
                // Well, the current href is working (obv)
                // So lets not fuck with it.
                // Just hack off the php variables, pop the a key (if set)
                // Add the new a key to whatever the go url is, and tape on.

                // Hack
                let curUrl = window.location.href.split("?");
                let urlVars = curUrl[1].split("&");
                let newVars = [];
                // Pop
                for (let v = 0; v < urlVars.length; v++) {
                    // Copy over all but a
                    if (urlVars[v].split("=")[0] !== "a") {
                        newVars.push(urlVars[v]);
                    }
                }
                // Add
                if (url.substring(1, 2) == "#") {
                    // Go to "main", no associate
                } else {
                    newVars.push("a=" + encodeURI(url.substring(1)));
                }
                // Tape
                this.url = curUrl[0] + "?" + newVars.join("&");
            } else if (url.substring(0, 1) == "?") {
                let curUrl = window.location.href.split("?");
                if (this.environment === "app" || this.environment === "offline") {
                    // map nodes only.
                    let props = url.split("?")[1].split("&").map(a => a.split("="));
                    if (props.find(p => (p[0] == "t" && p[1] == "m"))) {
                        this.url = props.find(p => p[0] == "nn")[1] + ".html";
                    }
                } else {
                    this.url = curUrl[0] + url;
                }
            } else {
                this.url = this.clean(url);
            }
            if (preference == "popup") {
                this.popup(this.url, backupOpen);
            } else if (preference == "tab") {
                this.tab(this.url, backupOpen);
            } else if (preference == "window") {
                this.window(this.url, backupOpen);
            } else {
                error("warn", "UrlNav", "Unknown preference type '" + preference + "'. Defaulting to window");
                this.window(this.url, backupOpen);
            }
        }
    }
}
