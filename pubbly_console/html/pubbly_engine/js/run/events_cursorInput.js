/*
    An inbetween so that both server side regular browser and apk mobile stuffs can be talking about the same X Y coordinates.
*/
function CursorInput() {
    // Do we need scope here?
    const _Touch = this;
    this.getLoc = function (e, offsets) {
        if (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].pageX) {
            return [
                e.changedTouches[0].pageX + offsets.pageOffsetX,
                e.changedTouches[0].pageY + offsets.pageOffsetY,
                now()
            ];
        } else if (e.offsetX) {
            return [
                e.offsetX + offsets.pageOffsetX,
                e.offsetY + offsets.pageOffsetY,
                now()
            ];
        }   else {
            console.warn("Can't get touch or mouse loc");
            return [
                false,
                false,
                now()
            ]
        }
    }
}
