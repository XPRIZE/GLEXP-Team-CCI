class DrawingTools {
    drawStop() {
        this.lastLoc = false;
        // this.ctxs.map(ctx => ctx.hasBeenInitialized = false);
        this.temporaryDrawData.pencilPath = [];
        if (this.drawCtx) {
            this.drawCtx.drawImage(this.effectCanvas, 0, 0);
            this.ectx.canvas.width = this.ectx.canvas.width * 1;
            this.drawCtx = false;
        }
    }
    draw(ctx, loc) {
        if (typeof this["draw_" + this.tool.type] === "function") {
            if (!this.lastLoc) {
                this.lastLoc = loc;
            }
            this["draw_" + this.tool.type](ctx, loc);
            this.lastLoc = loc;
        } else {
            console.error("PubblyDrawingTools.draw: Unknown tool " + this.tool.type);
        }
    }
    draw_none() {}
    draw_eraser(ctx, loc) {
        let eraserDims = [50, 40];
        ctx.clearRect(loc[0], loc[1], eraserDims[1] + 5, eraserDims[0] + 2);
    }
    init_chalk(ctx, loc) {
        this.drawCtx = ctx;
        this.effectCanvas.width = ctx.canvas.width;
        this.effectCanvas.height = ctx.canvas.height;
        this.ectx.lineCap = "butt";
        this.ectx.globalAlpha = this.tool.color[3] / 100;
        this.ectx.lineWidth = this.tool.width;
        this.ectx.strokeStyle = 'rgba(' + this.tool.color.slice(0, 3).join(",") + ',' + (0.4 + Math.random() * 0.2) + ')';
        this.ectx.hasBeenInitialized = true;
    }
    draw_chalk(ctx, loc) {
        if (!this.drawCtx) {
            this.init_chalk(ctx, loc);
        } else if (ctx !== this.drawCtx) {
            console.error("Only one workspace at a time");
        }
        let brushDiameter = this.tool.width;
        let last = this.lastLoc;

        this.ectx.beginPath();
        this.ectx.moveTo(last[0], last[1]);
        this.ectx.lineTo(loc[0], loc[1]);
        this.ectx.stroke();

        // Chalk Effect
        let length = Math.round(Math.sqrt(Math.pow(loc[0] - last[0], 2) + Math.pow(loc[1] - last[1], 2)) / (5 / brushDiameter));
        let xUnit = (loc[0] - last[0]) / length;
        let yUnit = (loc[1] - last[1]) / length;
        for (var i = 0; i < length; i++) {
            let xCurrent = last[0] + (i * xUnit);
            let yCurrent = last[1] + (i * yUnit);
            let xRandom = xCurrent + (Math.random() - 0.5) * brushDiameter * 1.2;
            let yRandom = yCurrent + (Math.random() - 0.5) * brushDiameter * 1.2;
            this.ectx.clearRect(xRandom, yRandom, Math.random() * 2 + 2, Math.random() + 1);
        }
    }
    init_pencil(ctx, loc) {
        this.drawCtx = ctx;
        this.effectCanvas.width = ctx.canvas.width;
        this.effectCanvas.height = ctx.canvas.height;
    }
    draw_pencil(ctx, loc) {
        if (!this.drawCtx) {
            this.init_pencil(ctx, loc);
        } else if (ctx !== this.drawCtx) {
            console.error("Only one workspace at a time");
        }
        this.temporaryDrawData.pencilPath.push(loc);
        this.ectx.canvas.width = this.ectx.canvas.width * 1;
        this.ectx.lineCap = "round";
        this.ectx.lineJoin = "round";
        this.ectx.lineWidth = this.tool.width;
        this.ectx.globalAlpha = this.tool.color[3];
        this.ectx.strokeStyle = "rgba(" + this.tool.color.join(",") + ")";
        this.ectx.globalCompositeOperation = "copy";
        this.ectx.beginPath();
        this.ectx.moveTo.apply(this.ectx, this.temporaryDrawData.pencilPath[0]);
        let moveOrLine = "line";
        this.temporaryDrawData.pencilPath.map(pt => {
            if (!pt) {
                moveOrLine = "move";
            } else {
                if (moveOrLine === "move") {
                    this.ectx.moveTo.apply(this.ectx, pt);
                    moveOrLine = "line";
                } else {
                    this.ectx.lineTo.apply(this.ectx, pt);
                }
            }
        });
        this.ectx.stroke();
        // ctx.drawImage(this.effectCanvas, 0, 0);
    }

    change(to) {
        if (["eraser", "chalk", "pencil", "none"].indexOf(to.type) === -1) {
            console.error("PubblyDrawingTools.change: Unknown type " + to.type);
        } else {
            // Default alpha of 1 for all
            if (to.color && to.color.length === 3) {
                to.color.push(1);
            }
            let defaults = {
                none: {

                },
                eraser: {
                    height: 90,
                    width: 75,
                    cursor: "draw-eraser"
                },
                pencil: {
                    color: [255, 255, 255, 1],
                    height: 5,
                    width: 5,
                    cursor: "draw-pencil"
                },
                chalk: {
                    color: [255, 255, 255, 1],
                    height: 15,
                    width: 15,
                    cursor: "draw-chalk"
                }
            };
            if (to.color[3] && to.color[3] > 1) {
                // Is opacity a percentage or a decimal? who cares.
                to.color[3] /= 100;
                to.color[3] = Math.min(to.color[3]*3, 1);
            }
            this.tool = Object.assign(defaults[to.type], to);
            return true;
        }
        return false;
    }
    constructor(defaultTool) {
        this.tool = {
            type: "none",
            cursor: "draw-none"
        };
        this.effectCanvas = document.createElement("canvas");
        /*
         document.body.append(this.effectCanvas);
         $(this.effectCanvas).css({"top": 0, "right": 0, "position": "absolute", "background-color": "white"});
         */
        this.ectx = this.effectCanvas.getContext('2d');
        this.drawCtx = false;
        this.temporaryDrawData = {
            // Array of points pencil has been
            pencilPath: [],
        };
        if (defaultTool && defaultTool.type) {
            this.change(defaultTool);
        }
    }
}
class PubblyDrawingTools extends DrawingTools {
    change(to) {
        if (super.change(to)) {
            this._Pubbly.data.drawingTool = to;
            return true;
        } else {
            return false;
        }
    }
    constructor(pubblyScope, defaultTool) {
        super(defaultTool);
        this._Pubbly = pubblyScope;
    }
}