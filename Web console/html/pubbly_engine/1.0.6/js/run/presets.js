function PresetAsset(type, src, cb) {
    let elem;
    if (type == "image") {
        elem = new Image();
        elem.onload = cb;
    }   else if (type == "audio") {
        elem = new Audio();
        elem.oncanplay = cb;
    }
    elem.src = src;
    elem.onerror = function () {
        console.error("Preset: " + src + " did not load. Calling back anyway");
        cb();
    };
    return elem;
}

function PresetHandler(list, cb) {
    const _This = this;

    let loadTimeout = window.setTimeout(function () {
        console.error("Preset Asset Load timed out, calling back before full load");
        calledBack = true;
        cb();
    }, 2000);
    let loadNum = 0;
    let calledBack = false;
    for (let l = 0; l < list.length; l++) {
        this[list[l][0]] = new PresetAsset(
            list[l][1],
            "pubbly_engine/shared/" + list[l][2],
            function () {
                loadNum++;
                if (loadNum === list.length && !calledBack) {
                    calledBack = true;
                    window.clearTimeout(loadTimeout);
                    cb();
                }
            });
    }
}
