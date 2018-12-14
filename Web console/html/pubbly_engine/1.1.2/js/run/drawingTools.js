class DrawingTools {
    drawStop() {
        this.lastLoc = false;
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
        let eraserDims = [90, 75];
        ctx.clearRect(loc[0] + 5, loc[1] - 2, eraserDims[1] + 5, eraserDims[0] + 2);
    }
    draw_chalk(ctx, loc) {
        let color = this.tool.color;
        let width = this.tool.width;
        let brushDiameter = width;
        let last = this.lastLoc;

        ctx.globalAlpha = color[3] / 100;
        ctx.lineWidth = width;
        ctx.strokeStyle = 'rgba(' + color.slice(0,3).join(",") + ',' + (0.4 + Math.random() * 0.2) + ')';
        ctx.beginPath();
        ctx.moveTo(last[0], last[1]);
        ctx.lineTo(loc[0], loc[1]);
        ctx.stroke();

        // Chalk Effect
        let length = Math.round(Math.sqrt(Math.pow(loc[0] - last[0], 2) + Math.pow(loc[1] - last[1], 2)) / (5 / brushDiameter));
        let xUnit = (loc[0] - last[0]) / length;
        let yUnit = (loc[1] - last[1]) / length;
        for (var i = 0; i < length; i++) {
            let xCurrent = last[0] + (i * xUnit);
            let yCurrent = last[1] + (i * yUnit);
            let xRandom = xCurrent + (Math.random() - 0.5) * brushDiameter * 1.2;
            let yRandom = yCurrent + (Math.random() - 0.5) * brushDiameter * 1.2;
            ctx.clearRect(xRandom, yRandom, Math.random() * 2 + 2, Math.random() + 1);
        }
    }
    draw_pencil(ctx, loc) {
        let color = this.tool.color;
        let width = this.tool.width;
        let last = this.lastLoc;

        ctx.lineWidth = width;
        ctx.globalAlpha = color[3] / 100;
        console.log(color);
        ctx.strokeStyle = "rgba(" + color.join(",") + ")";
        ctx.beginPath();
        ctx.moveTo(last[0], last[1]);
        ctx.lineTo(loc[0], loc[1]);
        ctx.stroke();
    }

    change(to) {
        console.log(to);
        if (["eraser", "chalk", "pencil"].indexOf(to.type) === -1) {
            console.error("PubblyDrawingTools.change: Unknown type " + to.type);
        } else {
            // Default alpha of 1 for all
            if (to.color.length === 3) {
                to.color.push(1);
            }
            ;
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