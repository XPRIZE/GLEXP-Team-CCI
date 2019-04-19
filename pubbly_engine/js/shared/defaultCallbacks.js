/*
Found that I was using the cbs prop in a lot of places... And sometimes there was no decent function to associate with prog or fail or whatever
So it's easier to just merge the custom cbs prop with the default prop, which is just empty functions, so that you can call cbs.prog even if nothing was originally sent in
*/
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