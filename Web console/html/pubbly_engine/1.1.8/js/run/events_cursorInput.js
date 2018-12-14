function CursorInput() {
    // Do we need scope here?
    // const _Pubbly = pubblyScope;
    const _Touch = this;
    // Which ever function works
    this.passed = false;
    this.touchLoc = function (e, offsets) {
        return [
            e.originalEvent.changedTouches[0].pageX + offsets.pageOffsetX,
            e.originalEvent.changedTouches[0].pageY + offsets.pageOffsetY,
            now()];
    }
    this.mouseLoc = function (e, offsets) {
        return [
            e.offsetX + offsets.pageOffsetX,
            e.offsetY + offsets.pageOffsetY,
            now()];
    };
    this.getLoc = function(e, offsets) {
        if (_Touch.passed) {
            return _Touch.passed(e, offsets);
        }   else    {
            let firstTimeRet = false;
            // Always try the touch first (Mobile first)
            try {
                _Touch.firstTimeRet = _Touch.touchLoc(e, offsets);
                _Touch.passed = _Touch.touchLoc;
            } catch(err) {
                // needed?
                _Touch.firstTimeRet = false;
                _Touch.passed = false;
            }
            // If touch didn't work, try mouse
            if (!_Touch.firstTimeRet) {
                try {
                    _Touch.firstTimeRet = _Touch.mouseLoc(e, offsets);
                    _Touch.passed = _Touch.mouseLoc;
                } catch(err) {
                    // needed?
                    _Touch.firstTimeRet = false;
                    _Touch.passed = false;
                }
            }
            if (_Touch.firstTimeRet) {
                // Will skip _Touch next time, 'good' function linked to _Touch.passed.
                return _Touch.firstTimeRet;
            }   else    {
                // Neither the touch nor the mouse loc functions worked
                // Fatal error
                error("fatal","touch","Cannot get either touch or mouse locations from browser");
            }
        }
    }
}
