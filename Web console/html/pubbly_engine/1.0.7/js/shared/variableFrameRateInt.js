// Don't repeat yerself! TODO: Use this for page turning, drop reverts and the TODO line reverts


// Sample call
// new VariableInt(1000, {next:function(p) {console.log(p);},end:function() {console.log("end");}})
// Calls cbs.next with percentage as fast as possible. Percentage is calculated from elapsed time to account for performance drops.
// i.e., doesn't go 0.1,0.2,0.3
// goes 0.1, 0.125, 0.156, 0.23, 0.50, 0.59 ...
function VariableInt(time, cbs) {
    /*
     * time: How long the whole shebang lasts
     *
     * cbs: {
     *      next: Called with percentage done
     *      end: Called when finished
     * }
     */

    const _This = this;
    this.time = time;
    this.cbs = cbs;
    this.endStamp = now() + this.time;
    this.int = false;

    this.next = function() {
        let percentDone = 1 - (this.endStamp - now()) / this.time;
        if (percentDone >= 1) {
            this.cbs.end();
            window.clearInterval(this.int);
        }   else    {
            this.cbs.next(percentDone);
        }
    }
    this.int = window.setInterval(function() {
        _This.next.call(_This);
    }, 10);
}
