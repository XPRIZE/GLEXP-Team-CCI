// Helper.js
/*
 * Probably bad practice, but basically a "light" library of functions you might use somewhere else
 * If you want to copy from this project later on, this is where you check first.
 */

// TODO: ES6 on this, get blink out of global scope
function blink(elem, num) {
    var val = elem.getValue();
    var i = 0;
    var blinkFunc = function () {
        i++;
        if (i > (num * 2)) {
            window.clearInterval(blinkInt);
        } else {
            if (i % 2) {
                elem.setValue("");
                elem.refresh();
            } else {
                elem.setValue(val);
                elem.refresh();
            }
        }
    };
    blinkFunc();
    var blinkInt = window.setInterval(blinkFunc, 100);
}
// jason to Jason
function initCaps(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

let checkInputKeyAgainstArrayOfRequiredElementNamesAndReturnMissingArr = function (inputs, required) {
    /*
     * inputs: {canvas, title, whatever}
     * required: ["canvas", "title", "whatever"]
     * What it do: Checks inputs against required
     * Returns: array of missing inputs.
     */
    let missing = [];
    for (let i = 0; i < required.length; i++) {
        let elem = inputs[required[i]];
        if (
            // Element exists
            typeof elem !== "undefined" &&
            // Element is valid HTML (all have querySelector method) ((I think?))
            elem.querySelector) {
            // Nothing, elem is good!
        } else {
            missing.push(required[i]);
        }
    }
    // Javascript Ternary, google if confused.
    return missing;
}

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

function checkArrayForAllValuesOfDesiredType(arr, type) {
    /*
     * checkArrayForType([1,2,3,4], "string") // false, we want all strings
     * checkArrayForType([1,2,3,"a"], "number") // false, we want all numbers
     * checkArrayForType([1,2,3,4], "number") // true, all numbers
     */
    let firstMatch = arr.find(function (i) {
        // Find returns i when condition met (only returns once)
        // i.e., will return the i value of the first non-number item in arr
        return typeof i !== type;
    });
    return typeof firstMatch == "undefined";
}

// MIT - github.com/substack/point-in-polygon
function inside(point, vs) {
    // USAGE
    //      var poly = [[1,1],[1,2],[2,2],[2,1]];
    //      inside([1.5,1.5],poly) === true
    //
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect)
            inside = !inside;
    }

    return inside;
}


// Webix related

function setWebixInnerById(id, inner) {
    $($$(id).$view).find("button")[0].innerHTML = inner;
}
function deletePrompt(nameToCheck, typeOfDeletion, ajaxURL, callback) {
    if (window.confirm("You sure?")) {
        $.ajax(ajaxURL).done(
            function (ret) {
                if (ret == "done") {
                    if (callback) {
                        callback();
                    } else {
                        window.location.href = window.location.href;
                    }
                } else if (ret.split("error: ").length >= 2) {
                    var mesg = ret.replace("</br>", "\r\r");
                    webix.message(mesg);
                } else {
                    document.body.innerHTML = ret;
                }
            }
        );
    }
}




// It's not stealing, it's liberating
// MIT - github.com/scottglz/distance-to-line-segment

/**
 * @module distance-to-line-segment 
 */


/**
 * Calculate the square of the distance between a finite line segment and a point. This 
 * version takes somewhat less convenient parameters than distanceToLineSegment.squared,
 * but is more efficient if you are calling it multiple times for the same line segment,
 * since you pass in some easily pre-calculated values for the segment.
 * @alias module:distance-to-line-segment.squaredWithPrecalc
 * @param {number} lx1 - x-coordinate of line segment's first point
 * @param {number} ly1 - y-coordinate of line segment's first point
 * @param {number} ldx - x-coordinate of the line segment's second point minus lx1
 * @param {number} ldy - y-coordinate of the line segment's second point minus ly1
 * @param {number} lineLengthSquared - must be ldx\*ldx + ldy\*ldy. Remember, this precalculation
 *    is for efficiency when calling this multiple times for the same line segment.
 * @param {number} px - x coordinate of point
 * @param {number} py - y coordinate of point
 */

function distanceSquaredToLineSegment2(lx1, ly1, ldx, ldy, lineLengthSquared, px, py) {
    var t; // t===0 at line pt 1 and t ===1 at line pt 2
    if (!lineLengthSquared) {
        // 0-length line segment. Any t will return same result
        t = 0;
    } else {
        t = ((px - lx1) * ldx + (py - ly1) * ldy) / lineLengthSquared;

        if (t < 0)
            t = 0;
        else if (t > 1)
            t = 1;
    }

    var lx = lx1 + t * ldx,
        ly = ly1 + t * ldy,
        dx = px - lx,
        dy = py - ly;
    return dx * dx + dy * dy;
}

/**
 * Calculate the square of the distance between a finite line segment and a point. 
 * @alias module:distance-to-line-segment.squared
 * @param {number} lx1 - x-coordinate of line segment's first point
 * @param {number} ly1 - y-coordinate of line segment's first point
 * @param {number} lx2 - x-coordinate of the line segment's second point
 * @param {number} ly2 - y-coordinate of the line segment's second point
 * @param {number} px - x coordinate of point
 * @param {number} py - y coordinate of point
 */

function distanceSquaredToLineSegment(lx1, ly1, lx2, ly2, px, py) {
    var ldx = lx2 - lx1,
        ldy = ly2 - ly1,
        lineLengthSquared = ldx * ldx + ldy * ldy;
    return distanceSquaredToLineSegment2(lx1, ly1, ldx, ldy, lineLengthSquared, px, py);
}

/**
 * Calculate the distance between a finite line segment and a point. Using distanceToLineSegment.squared can often be more efficient.
 * @alias module:distance-to-line-segment
 * @param {number} lx1 - x-coordinate of line segment's first point
 * @param {number} ly1 - y-coordinate of line segment's first point
 * @param {number} lx2 - x-coordinate of the line segment's second point
 * @param {number} ly2 - y-coordinate of the line segment's second point
 * @param {number} px - x coordinate of point
 * @param {number} py - y coordinate of point
 */

function distanceToLineSegment(lx1, ly1, lx2, ly2, px, py) {
    return Math.sqrt(distanceSquaredToLineSegment(lx1, ly1, lx2, ly2, px, py));
}
// Quick test
// console.log(distanceToLineSegment(0, 0, 10, 10, 5, 5));
// >>> 0
// Yup

function angle(cx, cy, ex, ey) {
    var dy = ey - cy;
    var dx = ex - cx;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    //if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
}

function getSlope(x1, y1, x2, y2) {
    return (y2 - y1) / (x2 - x1);
}

function round(x, y) {
    return Math.ceil(x / y) * y;
}