// CURRENTLY UNFREAKINGUSED

/*
 Sample call
 new VariableInt(
 1000, 
 {
 next:function(p) {console.log(p);},
 end:function() {console.log("end");}
 }
 )
 Calls cbs.next with percentage as fast as possible. Percentage is calculated from elapsed time to account for performance drops.
 i.e., doesn't go 0.1,0.2,0.3
 goes 0.1, 0.125, 0.156, 0.23, 0.50, 0.59 ...
 */
class VariableInt {
    next() {
        let percentDone = 1 - (this.endStamp - now()) / this.time;
        if (percentDone >= 1) {
            this.cbs.end();
            window.clearInterval(this.int);
        } else {
            this.cbs.next(percentDone);
        }
    }
    constructor(time, cbs) {
        this.next = this.next.bind(this);
        
        // time >> miliseconds until the end of the animation
        this.time = time;
        // cbs.next >> Cb for every tick, to be called back with the percentage till the end
        // cbs.end >> CB for the end of the sequence.
        this.cbs = cbs;
        
        this.endStamp = Date.now() + this.time;
        this.int = window.setInterval(this.next, 10);
    }
}
