/*
    element.js
    Author: Wallis Muraca

    Element parent class
*/

class NavigationNodes_element {

    // When an element is first activated, 
    // see if disabled. If not, execute callback function
    // after making appropriate canvas calculations
    eventMain(cb, eventName, e) {
        // Has this event been disabled? 
        if (this.disabled.indexOf(eventName) === -1) {
            let relLoc = {x: e.offsetX, y: e.offsetY};
            if (this.zoom) {
                relLoc.x /= this.zoom;
                relLoc.y /= this.zoom;
            }
            if (this.offset) {
                relLoc.x -= this.offset[0];
                relLoc.y -= this.offset[1];
            }

            // Freshly calculated new x,y w/ zoom + pan
            cb(relLoc, e, this.elem);
        } else {
            console.warn("Callback recieved but element disabled");
        }
    }

    // which: name of event, like a click
    // cb: actual function being executed on the click
    attachEvent(which, cb) {
        // indexOf returns -1 if arg1 isn't in array.
        if (this.availableEvents.indexOf(which) >= 0) {
            // Bind attaches the first arg to the function call... essentially cutting out the _This solution or the scope apply callbacks (ES6)
            this.elem.addEventListener(which, this.eventMain.bind(this, cb, which));
        } else {
            console.error("Event " + which + " not available for element: ");
            console.error(this.elem);
            console.error("Please ensure the inhereted class properly pushes all custom events to the this.availableEvents array. Currently, the only allowed events are " + this.availableEvents.join(","));
        }

    }
    enableEvent(which) {
        if (which == "all") {
            this.disabled = [];
            $(this.elem).removeClass("all_disabled");
        } else if (this.disabled.indexOf(which) !== -1) {
            // Remove arg2 items, starting at arg1
            this.disabled.splice(this.disabled.indexOf(which), 1);
            $(this.elem).removeClass("_disabled");
        } else {
            console.warn("Event " + which + " is not currently disabled.");
        }
    }
    disableEvent(which) {
        if (which == "all") {
            // Copy all available events.
            /*
             * DO NOT set
             *      this.disabled = this.availableEvents
             * This does not copy the array, but rather sets it as a reference.
             * Consider the following
             * 
             * let arr1 = [1,2,3]
             * let arr2 = arr1;
             * // changes made to arr1 effect arr2
             * arr1.push(4);
             * console.low(arr2); // --> [1,2,3,4]
             */
            this.disabled = this.availableEvents.slice();
            $(this.elem).addClass("all_disabled");
        } else if (this.disabled.indexOf(which) === -1) {
            // Not currently in disabled arr
            this.disabled.push(which);

            $(this.elem).addClass("_disabled");
        } else {
            console.warn("Event " + which + " is already disabled.");
        }
    }

    changeCursor(what) {
        // Empty arg call resets
        // Jquery call (!)
        // Inserts CSS to change pointer
        // what = what || 'auto' means if what is undefined, return auto
        // otherwise return what
        what = what || "auto";
        $(this.elem).css("cursor", what);
    }

    constructor(elem) {
        this.elem = elem;

        // Array of disabled events
        this.disabled = [];
        // Augmented by extended classes, but all html elements at least have these
        // (Note, when inline html, it's all "onmousedown, onclick"
        // But when attaching with the addEventListener call, it's just "mousedown, click"
        // Three defaults added in super, individual events (like click or keyDown or whatever) can be added through the extended classes
        this.availableEvents = [
            "mousedown",
            "mousemove",
            "mouseup",
            "mouseout",
            "mousewheel"
        ];

        this.events = {};
    }
}