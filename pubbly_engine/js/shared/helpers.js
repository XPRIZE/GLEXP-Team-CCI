// ME STUFF

// Stuff too small to care about and too common to rewrite.

// Take pubbly data image and create a poly link same format as regular links from it.
function imgToPoly(img) {
    let poly = [];
    poly.push([img.loc[1], img.loc[0]]);
    poly.push([img.loc[1] + img.width, img.loc[0]]);
    poly.push([img.loc[1] + img.width, img.loc[0] + img.height]);
    poly.push([img.loc[1], img.loc[0] + img.height]);
    poly.push([img.loc[1], img.loc[0]]);
    return poly;
}

// Remove js object reference problems from any type of thing... not sure where used, probably _Pubbly
function cutLink(val) {
    switch (typeof val) {
        case "string":
            return val + "";
            break;
        case "number":
            return val * 1;
            break;
        case "undefined":
            return undefined;
            break;
        case "null":
            return null;
            break;
        case "array":
            return val.slice();
            break;
        case "object":
            // NOPE. Because typeof new Array is OBJECT because
            if (Array.isArray(val)) {
                return val.slice();
            } else {
                return jQuery.extend(true, {}, val);
            }
            break;
        case "boolean":
            return val == true;
            break;
    }
}

function centerOfPoly(poly) {
    // Get furthest top, right, bottom, left... then avg?
    let xMax = 0, yMax = 0;
    let xMin = poly[0][0], yMin = poly[0][1];
    // poly is [x, y] format
    for (let p = 0; p < poly.length; p++) {
        xMax = Math.max(xMax, poly[p][0]);
        xMin = Math.min(xMin, poly[p][0]);

        yMax = Math.max(yMax, poly[p][1]);
        yMin = Math.min(yMin, poly[p][1]);
    }
    // Return in top left
    return [yMin + (yMax - yMin) / 2, xMin + (xMax - xMin) / 2];
}
function ptOffset(pt, offset) {
    return ptsOffset([pt], offset)[0];
}
function ptsOffset(pts, offset) {
    if (!pts.length) {
        return [pts[0] + offset[0], pts[1] + offset[1]];
    } else {
        for (let p = 0; p < pts.length; p++) {
            pts[p][0] += offset[0];
            pts[p][1] += offset[1];
        }
        return pts;
    }
}
function animLegNextByPercent(cur, next, percent) {
    return cur + ((next - cur) * percent);
}
function dupeAnyType(newVal) {
    // Check for newVal type, and dupe accordingly (severs link)
    let propType = typeof newVal;
    if (propType == "number") {
        newVal *= 1;
    } else if (propType == "string") {
        newVal += "";
    } else if (propType == "boolean") {
        newVal = !!newVal;
    } else if (propType == "object") {
        if (newVal.length !== "undefined") {
            // array
            newVal = newVal.slice();
        } else {
            // Shouldn't need anything more than shallow...
            // If we do, big problem. Fix that, not this.
            newVal = jQuery.extend({}, newVal);
        }
    }
    return newVal;
}
// rand(5) => random between 0 and 5
// rand(5, 10) => random between 5 and 10
function rand(n1, n2) {
    let upper, lower;
    if (typeof n2 == "undefined") {
        upper = n1
        lower = 0;
    } else {
        upper = n2;
        lower = n1;
    }
    // rand(5) => random between 0 and 5
    //  -- upper:5, lower:0
    // rand(5,10) => random between 5 and 10
    //  -- upper:10, lower:5

    let dif = upper - lower;
    return lower + Math.floor(Math.random() * (dif + 1));
}


// Cause I just want to see the first level props and I don't want to MOVE MY HAND TO THE MOUSE CAUSE THAT"S FAILURE
console.open = function (what) {
    console.log(JSON.stringify(what, undefined, 2));
}



// function now()
if (false /*Turns out Date.now is waay fater */
        /*window.performance && window.performance.now*/) {
    // TODO: Fix this to get a smaller less accurate number. If book stays open for an hour, timestamps will be yuge. Maybe an interval function to reset the counter to 0?
    function now() {
        return window.performance.now()
    }
} else {
    function now() {
        return Date.now();
    }
}


function useTouch() {
    // TODO: probably needs to be better
    // BUG: Doesn't work for laptops with touch screen!! Thanks Cristina
    return (('ontouchstart' in window) || // html5 browsers
        (navigator.maxTouchPoints > 0) || // future IE
        (navigator.msMaxTouchPoints > 0))
}




// NOT ME

// StackOverflow?
function autocase(text) {
    // hi there -> Hi there
    return text.replace(/(&)?([a-z])([a-z]{2,})(;)?/ig, function (all, prefix, letter, word, suffix) {
        if (prefix && suffix) {
            return all;
        }

        return letter.toUpperCase() + word.toLowerCase();
    });
}

// MIT © Dawson Botsford
function arrayToHuman(arr) {
    // ["a","b","c"] -> "a, b and c"
    var outStr = "";
    if (arr.length === 1) {
        outStr = arr[0];
    } else if (arr.length === 2) {
        //joins all with "and" but no commas
        //example: "bob and sam"
        outStr = arr.join(' and ');
    } else if (arr.length > 2) {
        //joins all with commas, but last one gets ", and" (oxford comma!)
        //example: "bob, joe, and sam"
        outStr = arr.slice(0, -1).join(', ') + ', and ' + arr.slice(-1);
    }
    return outStr;
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

