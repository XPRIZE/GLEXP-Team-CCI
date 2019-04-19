
function pubColor(name, format) {
    // name: red, format: hex
    let codes = {
        "purple":{
            "hex":"8768AE",
            "rgb":[136,103,172],
        },
        "blue":{
            "hex":"3B4D83",
            "rgb":[57,77,129],
        },
        "orange": {
            "hex":"E06515",
            "rgb":[226,98,35],
        },
        "red": {
            "hex":"B02927",
            "rgb":[179, 36, 42],
        },
        "darkred": {
            "hex":"6B161A",
            "rgb":[107, 22, 26],
        },
        "lightblue": {
            "hex":"5EABC6",
            "rgb":[91, 173, 198],
        },
        "green": {
            "hex":"92BC3A",
            "rgb": [145, 188, 72],
        },
        "white": {
            "hex":"000000",
            "rgb": [0,0,0],
        }
    }

    // Format is either RGB or HEX depending on preference, but is always something no matter what the pass
    if (format) {
        format = (format == "rgb") ? "rgb" : "hex";
    }   else    {
        format = "rgb";
    }
    if (codes[name]) {
        return codes[name][format];
    }   else    {
        error("warn", "colors", "Unknown color code of " + name + ", returning white " + format);
        return codes["default"][format];
    }
}
