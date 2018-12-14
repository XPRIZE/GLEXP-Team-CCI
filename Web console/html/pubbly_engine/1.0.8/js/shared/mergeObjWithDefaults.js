function mergeObjWithDefaults(customs, defaults) {
    /*
     * obj1 = {"b":"NEW VALUE"}
     * obj2 = {"a":1, "b":2, "c": 3}
     * obj3 = mergeObjWithDefaults(obj1, obj2); // {a: 1, b: "NEW VALUE", c: 3}
     * Useful for incomplete objArg calls... i.e.
     function BigFatClass(info) {
     let defaultInfo = {name: "John", age: 20, favFood: "bananas"}
     let info = mergeObjWithDefaults(info, defaultInfo);
     // Info now has all expected values, but you don't have to clutter up your init with every possible one.
     }
     new BigFatClass({name:"jason", age: 25});
     */
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