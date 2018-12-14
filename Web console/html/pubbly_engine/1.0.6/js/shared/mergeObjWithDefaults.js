function mergeObjWithDefaults(customs, defaults) {
    let merged = {};
    for (let prop in defaults) {
        if (typeof customs[prop] !== "undefined") {
            merged[prop] = customs[prop];
        }   else    {
            merged[prop] = defaults[prop];
        }
    }
    return merged;
}