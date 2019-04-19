/*
    element_Canvas.js
    Author: Wallis Muraca

    Handles calls to the context, draws, zooms, pans, etc.
*/

class NavigationNodes_Canvas extends NavigationNodes_element {
    clear() {
        this.elem.width = this.elem.width;
    }

    // Draw a rectangle in a desired color
    drawRect(color, x, y, w, h) {
        if (checkArrayForAllValuesOfDesiredType([x, y, w, h], "number")) {
            let rectLineWidth = 2;
            this.ctx.beginPath();
            let rect = [x - rectLineWidth,
                y - rectLineWidth,
                w + rectLineWidth,
                h + rectLineWidth];
            this.ctx.scale(this.zoom, this.zoom);
            this.ctx.translate(this.offset[0], this.offset[1]);
            this.ctx.strokeStyle = color;
            this.ctx.rect.apply(this.ctx, rect);
            this.ctx.lineWidth = rectLineWidth + 1;
            this.ctx.stroke();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        } else {
            console.error("Canvas draw error, one of the argments passed was not a number");
        }

    }
    drawLine(color, x1, y1, x2, y2) {
        if (checkArrayForAllValuesOfDesiredType([x1, y1, x2, y2], "number")) {
            this.ctx.scale(this.zoom, this.zoom);
            this.ctx.translate(this.offset[0], this.offset[1]);

            this.ctx.beginPath();
            this.ctx.strokeStyle = color;
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke()

            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        } else {
            console.error("Canvas draw error, one of the argments passed was not a number");
        }
    }
    drawArrow(color, x1, y1, x2, y2, lw=1) {
        if (checkArrayForAllValuesOfDesiredType([x1, y1, x2, y2], "number")) {

            this.ctx.scale(this.zoom, this.zoom);
            this.ctx.translate(this.offset[0], this.offset[1]);
            //TODO 10/3
            this.ctx.beginPath();

            this.ctx.lineWidth = lw;
            this.ctx.strokeStyle = color;
            this.ctx.fillStyle = color;




            this.ctx.beginPath();
            this.ctx.arrow(x1, y1, x2, y2, [0, 1, -10, 1, -10, 5]);
            this.ctx.stroke();
            this.ctx.fill();

            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        } else {
            console.error("Canvas draw error, one of the argments passed was not a number");
        }
        // this.ctx.arrow(node1.x, node1.y, node2.x, node2.y, [0, 1, -10, 1, -10, 5]);
        //this.ctx.fill();
        //this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    drawImage(src, x, y, w, h) {
        // helper.js
        if (checkArrayForAllValuesOfDesiredType([x, y, w, h], "number") && src.height > 0) {
            let args = [src, x, y, w, h];
            // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/scale
            this.ctx.scale(this.zoom, this.zoom);
            // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/translate
            this.ctx.translate(this.offset[0], this.offset[1]);
            this.ctx.drawImage.apply(this.ctx, args);
            // Basically a reset call for the scaling and translating above
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        } else {
            console.error("Canvas draw error, one of the argments passed was not a number");
        }

    }

    getCenter() {
        return [this.ctx.canvas.clientWidth*this.zoom + this.offset[0], this.ctx.canvas.clientHeight*this.zoom + this.offset[1]]; 
    }

    // ES6 goodness. A setter is a function call that looks like a property set. Perfect for our zoomFactor.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set
    set zoom(to) {
        if (typeof to == "number") {
            to = Math.min(1.5, to); // Zoom in level
            to = Math.max(0.1, to); // Zoom out level
            let zoomDif = to - this.zoomFactor;
            let newOffset = this.offset;
            newOffset[0] -= zoomDif * this.width / 2;
            newOffset[1] -= zoomDif * this.height / 2

            // Set offsetFactor direct, because could screw up the zoom if min/max didn't let the offset go through.
            this.offsetFactor = newOffset;
            this.zoomFactor = to;

        } else {
            console.error("Cannot set zoom to " + to + ", only numbers please.");
        }
    }
    get zoom() {
        return this.zoomFactor;
    }
    set offset(to) {
        if (typeof to[0] == "number" && typeof to[1] == "number") {
            to[0] = Math.min(1000, to[0]);
            to[0] = Math.max(-1000, to[0]);
            to[1] = Math.min(1000, to[1]);
            to[1] = Math.max(-1000, to[1]);
            this.offsetFactor = to;
        } else {
            console.error("Cannot set zoom to " + to + ", only [x, y] please.");
        }
    }
    get offset() {
        return this.offsetFactor;
    }

    constructor(elem, props) {
        super(elem);

        this.ctx = elem.getContext('2d');

        this.height = this.elem.height;
        this.width = this.elem.width;

        // NOTE: This should be the LAST time you access the zoomFactor and offsetFactor directly. It's for the default value. All other gets or sets should be done through the getter and setter
        // How zoomed in are we? (2 = 200% normal)
        this.zoomFactor = 1;
        // What's the graph value of the very top left? To start, 0,0. If you've panned and everything is a little lower, 0, -50
        this.offsetFactor = [0, 0];


        if (props.defaultZoom) {
            this.zoom = props.defaultZoom;
        } else {
            this.zoom = 0.25;
        }
        if (props.defaultOffset) {
            this.offset = props.defaultOffset;
        }
    }
}
