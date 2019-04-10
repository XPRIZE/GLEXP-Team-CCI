/*

One of the feature that we didn't even freaking use in the xprize

A pubbly save state is a pubbly where you CAN interrupt, but instead of just STOPPING the sequence and everything looks all half animated and trash, it RESETS the pubbly experience back to the last "good" position, which is basically everything's properties before you STARTED the sequence you just interrupted

Works surprisingly well, and this is where I was using lzw compress (to get smaller sizes of where everything was).

Had plans to be able to fast forward to end of sequence instead of this (reverting back to beginning), but that never happened

Had plans to have multiple "safe" saves, so you could go back 3 sequences in time, but that never happened

In fact the whole save states was never used for Xprize because content designers didn't want to give the kids the freedom to interrupt a sequence ever, which I think was a bad idea, but I'm not content so who cares

*/

function States(PubblyScope) {
    // TODO: Save the differences between each state and the pubbly.data init.
    // Benefit being yuge storage savings, meaning I can save ALL THE STATES going waay back.
    // Test this idea first though...
    const _Pubbly = PubblyScope;
    this.states = [];
    this.limit = 5;
    this.save = function () {
        this.states.push(_Pubbly.lzwCompress.pack(_Pubbly.data));
        if (this.states.length > this.limit) {
            this.states.shift();
        }
    };
    this.load = function (rel) {
        rel = (typeof rel == "undefined") ? -1 : rel;
        let compressed = this.states[this.states.length + rel];
        if (compressed) {
            let attempt = _Pubbly.lzwCompress.unpack(compressed);
            if (attempt) {
                _Pubbly.data = attempt;
                _Pubbly.drawPage_dispatch();
            }
        } else {
            console.error("Cannot find relative state to load");
        }
    };
    this.checkInterruptionsAndSave = function(unblocked_cb) {
        // Callback if and when a new event interaction is allowed (a click, a turn, whatever);
        if (_Pubbly.sequence.running) {
            if (_Pubbly.data.info.interrupt === true) {
                // Sequence running, but we CAN interrupt
                // Interrupt
                _Pubbly.sequence.kill();
                if (_Pubbly.data.info.saveStates) {
                    // Save state if we need to
                    _Pubbly.states.load(-1);
                }
                // Cleared for event
                unblocked_cb();
            }
        }   else    {
            // Cleared for event
            unblocked_cb();
        }
    }
    // Init
    this.save();
    return this;
}
