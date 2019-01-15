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

// let arr = [1,2,3]
// randInArray(arr) >> 2 or whatever
function randInArray(arr) {
    return arr[rand(arr.length - 1)];
}