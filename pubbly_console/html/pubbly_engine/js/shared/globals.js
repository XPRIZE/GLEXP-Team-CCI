/*
I used the convention of 
    a new Click goes into an array of all possible Clicks
In a number of different places... And it's helpful to be able to go from one to the other without having to hard code each singular to plural variation in the english language...

You'll see this in xmlToJson, _build I think and definitely sequences.
*/
window.reservedWords = {
    points: [
        "changed", // points.changed is an array of point names changed by sequencing
        "Fixed Text", // field.display == "Fixed Text" or "{NAME OF CUSTOM POINTS}"
    ],
}

window.plurals = {
    "image": "images",
    "gif": "gifs",

    "click": "clicks",
    "drop": "drops",
    "line": "lines",
    "trigger": "triggers",
    "dragStart": "dragStarts",
    "dragStop": "dragStops",
    "lineStart": "lineStarts",
    "lineStop": "lineStops",
    "countdown": "countdowns",
    "openPage": "openPages",
    "sequence":"sequences",

    "draft":"drafts",
    "book":"books",
    "point":"points",
}

// LAAAAZy boy
window.singulars = {};
for (let singular in window.plurals) {
    window.singulars[window.plurals[singular]] = singular;
}
