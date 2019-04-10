/*
Fields are hard

Needed a way to communicate somewhat exact measurements between livecode design tools fields, using whatever hecking font the designer happens to have loaded, and a set field height/width inside a browser

Font size turned out unreliable, so we stuck with "Fits the width of the field object dimensions",
but now we needed a way to GET what the max height/width related font widths were,

So it's a bunch of messy measure text loops, and they're all housed here a bit, although some parts are still in the _Pubbly draw field method.
*/
class fieldText {
    checkDrawTextPropsAndSetDefaults(props) {
        /*
         * What we're looking for
         * 
         * {
         *  top: INT,
         *  left: INT,
         *  maxWidth: INT,
         *  maxHeight: INT,
         *  pt: INT (optional),
         *  color: HEX (optional),
         *  boldColor: HEX (optional),
         *  insertionAt: INT (optional, but number of chars in)
         * }
         */
        let requiredTypeChecks = [
            ["top", "number"],
            ["left", "number"],
            ["maxWidth", "number"],
            ["maxHeight", "number"],
            ["align", ["left", "center", "right"]],
        ];
        let missingRequired = requiredTypeChecks.find(tc => {
            let checkAgainst = props[tc][1];
            if (typeof checkAgainst === "string") {
                return (typeof props[tc][0] === checkAgainst);
            } else if (typeof checkAgainst === "object") {
                return (checkAgainst.indexOf(props[tc][0]) !== -1);
            }
        });
        if (missingRequired) {
            return false;
        }
        return (missingRequired) ?
                false :
                Object.assign(
                        {
                            pt: false,
                            color: "FFF",
                            boldCoor: "00F",
                            align: "left",
                            font: "Didact",
                            insertionAt: false,
                        }, props);
    }

    drawTextFromDescriptiveLineList(ctx, lines, props) {
        /*
         * ctx: Canvas rendering context shit
         * lines: [
         *  {
         *      content: "Lorem ipsum dolor sit amet, ",
         *      offsetTop:0,
         *      offsetLeft:0,
         *      color: "FFF",
         *  },
         *  {
         *      content: "consectetur adipiscing elit, ",
         *      offsetTop:0,
         *      offsetLeft:120,
         *      color: "00F",
         *  },
         *  {
         *      content: "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",
         *      offsetTop: 30,
         *      offsetLeft: 30,
         *      color: "FFF",
         *  }
         * ],
         * props: {
         *  fontName: Didact,
         *  fontSize: 24,
         *  insertionAt: 5,
         *  top: 200,
         *  left: 200,
         * }
         */
    }
   
    // public
    drawText(ctx, content, props) {
        /*
         * Possible passes
         * ctx: Always context
         * content: "this is a single string" OR
         *  "This is a string \n with line breaks" OR
         *  "This is a string \n with line breaks **and colored bits"
         *  
         * props: {
         *  align: ["left", "center", "right"],
         *  size: [INT, false],
         *  font: "didact", or whatever,
         *  insertionAt: 3, // character at which there is an insertion point
         *  color: HEX,
         *  
         */
        let props = this.checkDrawTextPropsAndSetDefaults(props);
        if (!props) {
            console.error("BAD draw text call, not enough props, or some of them wrong or something");
            console.error(props);
            return false;
        }
        let maxWidth = props.maxWidth;
        let maxHeight = props.maxHeight;
        let rawLines = content.split('\n');
        let descriptiveLines = [];
        if (rawLines.length !== 1) {
            if (!props.size) {
                // Start checking at font size 124 (really big). Loop until all lines are below the maxWidth
            } else {
                // Make sure the longest line is below max width.
            }
        } else {
            if (!props.size) {
                // CAN'T! WON'T! Probably still possible, but very difficult to figure out.
                // Basically one long string of text, max height/width for dimensions,
                // And I need to get both line breaks and font size.
                // Not xprize, can wait
                console.error("Cannot have a autosized field with no line breaks.");
                return false;
            } else {
                // Loop through each word to determine line breaks.
                descriptiveLines = this.findLineBreaks(content, props.size, maxWidth, maxHeight);
            }
        }
    }
    construct() {
        // Used to measure lines of text
        this.mtx = document.createElement("canvas").getContext("2d");
        this.drawText = this.drawText.bind(this);
    }
}