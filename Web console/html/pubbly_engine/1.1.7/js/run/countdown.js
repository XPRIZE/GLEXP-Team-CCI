function Countdown(pubblyScope) {
    const _Pubbly = pubblyScope;
    const _This = this;
    this.at = 0;

    // Same basic set up as a sequence player class
    // Except not, because these stay alive after sequences have finished
    // And these start other sequences... and all sorts of stuff.

    // But basically...

    // Is the countdown counting down
    this.playing = false;
    // Has the countdown hit 0
    this.finished = false;
    // Has the countdown been killed by an external thing (not supported yet)
    this.killed = false;

    // Start a new countdown
    this.play = function () {
        if (!this.playing) {
            this.playing = true;
            this.int = window.setInterval(function () {
                _This.next.call(_This); // Fuck scope
            }, 1000);
        }
    };
    // Reset countdown, check for finished triggers on page
    this.finish = function () {
        window.clearInterval(this.int);
        this.playing = false;
        this.finished = true;

        _Pubbly.checkPageFor("countdowns");
    };
    // Kill countdown without checking any finished triggers
    this.kill = function () {
        window.clearInterval(this.int);
        this.at = 0;
        this.playing = false;
        this.killed = true;
    };
    // Stop is legacy... remove in xmlFormatting
    this.stop = this.kill;

    // Modification functions
    // Increase existing countdown
    this.mod_add = function (what) {
        let num = this.mod_check(what, "add");
        if (num) {
            this.at += num;
        }
    };
    // Set an existing countdown (do not start)
    this.mod_set = function (what) {
        let num = this.mod_check(what, "set");
        if (num) {
            this.at = num;
        }
    };
    // Decrease existing countdown (and check for finish)
    this.mod_subtract = function (what) {
        let num = this.mod_check(what, "subtract")
        if (num) {
            this.at -= num;
        }
    };

    // Make sure it's going to work and all
    this.mod_check = function (what, from) {
        if (typeof (what * 1) === "number") {
            return (what * 1);
        } else {
            console.error("Cannot set to " + what + ", only numbers allowed");
            return false;
        }
    };

    // Set to an integer (and start if positive)
    this.start_at = function (what) {
        let num = this.mod_check(what, "set");
        if (num) {
            this.at = num;
        }
        if (!this.playing) {
            this.play();
        }
    };

    // Non numerical mod functions, but outside hits none the less
    this.pause = function () {
        this.playing = false;
        window.clearInterval(this.int);
    };
    this.resume = function () {
        this.play();
    };

    // Interval function here
    this.int = false;
    // Actual function the interval calls here
    this.next = function () {
        this.at--;
        this.check();
    };
    this.check = function() {
        // Check interval redraw? Meh, only one frame a second, not a huge loss.
        _Pubbly.drawPage_dispatch();
        if (this.at <= 0) {
            this.finish();
        }
    }.bind(this);
}