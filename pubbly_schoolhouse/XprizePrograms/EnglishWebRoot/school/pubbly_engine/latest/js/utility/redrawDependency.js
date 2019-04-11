/*
 Keep track of everything moving (requiring that a canvas/whatever redraws)
 1 thing moving? Redraw at frame rate
 2 things moving? Redraw at same frame rate
 Remove a thing from list of moving things? If there's still stuff in the list, redraw at frame rate.
 
 add/remove can be basically anything
 */

class RedrawDependency {
    add(what) {
        // Add an item to the list of stuff requiring a redraw callback.
        // "what" can be literally anything, and will only remove if .remove(what) is === what
        this.depList.push(what);
        if (!this.interval) {
            this.interval = window.setInterval(this.redrawCallback, this.options.frameRate);
        }
    }
    remove(what) {
        // Remove element from deplist (even if elem is complext json obj)
        let origL = this.depList.lengh;
        this.depList = this.depList.filter(elem => elem !== what);
        if (origL === this.depList.length) {
            console.warn("RedrawDependency.remove: Argument passed is not in depedency list... Nothing removed");
        }
        if (this.depList.length === 0) {
            window.clearInterval(this.interval);
            this.interval = false;
            // Redraw final frame of animation once everything has finished.
            this.redrawCallback();
        }
    }
    constructor(redrawCallback, options) {
        if (typeof redrawCallback !== "function") {
            console.error("RedrawDependency.constructor (fatal): redrawCallback argument is NOT a function...");
        } else {
            // Caveman's autobind, cause no extra code
            this.add = this.add.bind(this);
            this.remove = this.remove.bind(this);

            // redrawCallback >> Bounded function to call on every framerate interval
            this.redrawCallback = redrawCallback;
            // options.frameRate >> the frameRate
            this.options = Object.assign({frameRate: 1}, options);

            // List of stuff causing the whatever to need a redraw.
            this.depList = [];
            // Interval function
            this.interval = false;
        }
    }
}