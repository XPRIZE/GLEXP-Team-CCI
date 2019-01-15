function assignDefaultCallbacks(cbs) {
    /** Make callbacks partially or fully optional
     * 
     * I.E., sometimes you just want a fail callback.
     * Sometimes you want a full three.
     * Sometimes you don't want any.
     * 
     * But it's a waste of time to check for typeof cbs.done == "function" every time
     * So this automatically assigns default empty cbs without overwriting those that are already there.
     * Should keep code cleaner.
     * 
     * AS A STANDARD FROM NOW ON, callbacks are 4 letters.
     * [done, fail, prog]
     */ 
    
    return Object.assign({
        done: function () {},
        fail: function () {},
        prog: function () {}
    }, cbs);
}