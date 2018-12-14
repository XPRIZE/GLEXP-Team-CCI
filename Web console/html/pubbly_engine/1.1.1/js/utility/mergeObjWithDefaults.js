/*
 obj1 = {"b":"NEW VALUE"}
 obj2 = {"a":1, "b":2, "c": 3}
 obj3 = mergeObjWithDefaults(obj1, obj2); // {a: 1, b: "NEW VALUE", c: 3}

 Useful for incomplete objArg calls... i.e.
 function BigFatClass(options) {
    let defaultOptions = {name: "John", age: 20, favFood: "bananas"}
    let options = mergeObjWithDefaults(info, defaultInfo);
    // Info now has all expected values, but you don't have to clutter up your init with every possible one.
 }
 new BigFatClass({name:"jason", age: 25});
 */
// OUTDATED as of ES6...
// Use Object.assign(defaults, customs) from now on.
// And soon (ES2018) merged = {...defaults, ...customs}
function mergeObjWithDefaults(customs, defaults) {
    if (typeof customs == "undefined") {
        return defaults;
    } else {
        let merged = {};
        for (let prop in defaults) {
            if (typeof customs[prop] !== "undefined") {
                merged[prop] = customs[prop];
            } else {
                merged[prop] = defaults[prop];
            }
        }
        return merged;
    }
}
