class Cursors {
    // set("drag", "default")
    // set("drag", "hover")
    set(pubblyAction, mouseAction = "default") {
        // Use the drag specific cursor icons, or if none, use default for action (click or wahtev)
        let cursors = this.library[mouseAction];
        // This mess to translate the css hover states to the 
        //  No WE CHROME came up with it first so it's got to have a -webkit in front
        //  NO WEE FIREFOX CAME UP WITH IT so it has to have a MOZ in front
        //  NO WEEEE APPPPPPLE came up with it
        // garbage
        let cursor = cursors[pubblyAction] || this.library["default"][pubblyAction];
        // Remove all cursor based classes
        this.elem[0].classList.forEach(c => {
            if (c.split("cursor-")[1])
                this.elem.removeClass(c);
        });
        // Add cursor class specific to what we actually want to display
        this.elem.addClass("cursor-" + cursor);
    }
    construct_library() {
        this.library = {
            // Reference sheet: https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
            // MDN best network

            // Update on drawing tool change in sequences
            // _Pubbly.drawingTool.cursorCSS

            // Default library for anything not in the specific library
            //  -- Reason, we don't want to copy "clicks": "pointer" for 5 our of the 7 libraries... Only the 2 libraries where it's DIFFERENT from pointer.
            default: {
                undefined: "default",
                false: "default",
                "drag": "grabbing",
                "clone": "grabbing",
                "single": "crosshair",
                "multiple": "crosshair",
                "field": "text",
                "clicks": "pointer",
                "draw-none": "default",
                "draw-eraser": "eraser",
                "draw-pencil": "pencil",
                "draw-chalk": "chalk",
                "editText": "text"
            },
            down: {
            },
            hover: {
                "drag": "grab",
                "clone": "grab",
                "single": "cell",
                "multiple": "cell"
            },
            drag: {
                "drop": "grabbing",
                "no-drop": "no-drop"
            },
            line: {
                // TODO: Some visual way to comminucate the user can or cannot end a line
            },
            interruptableSequence: {
                "drag": "progress",
                "clone": "progress",
                "single": "progress",
                "multiple": "progress",
                "field": "progress",
                "clicks": "progress",
                "draw": "progress",
                "editText": "progress"
            },
            uninterruptableSequence: {
                undefined: "wait",
                false: "wait",
                "drag": "wait",
                "clone": "wait",
                "single": "wait",
                "multiple": "wait",
                "field": "wait",
                "clicks": "wait",
                "draw": "wait",
                "editText": "wait"
            }
        };
    }
    constructor(elem) {
        this.elem = elem;

        this.construct_library();

        this.set = this.set.bind(this);
    }
}