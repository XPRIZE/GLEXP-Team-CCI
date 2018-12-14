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
