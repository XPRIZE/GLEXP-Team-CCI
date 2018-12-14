function Workspace(curObj, workspaceDom) {
    const _This = this;

    this.init = function () {
        this.elem = document.createElement("canvas");
        this.elem.setAttribute("height", curObj.height);
        this.elem.setAttribute("width", curObj.width);
        this.elem.style.backgroundColor = "white";

        workspaceDom.appendChild(this.elem);
        this.ctx = this.elem.getContext("2d");
    };
    this.clear = function () {
        this.elem.width = this.elem.width;
    };
    this.start = function (tool, loc) {
        this.lastLoc = loc;
        this.draw(tool, loc);
    }
    this.draw = function (tool, loc) {
        if (this.tools[tool.type]) {
            this.tools[tool.type].call(this, loc, tool);
            this.lastLoc = loc;
        }
    }
    this.tools = {
        eraser: function (loc, specifics) {
            let eraserDims = [90, 75]; // TODO: FIXFIXFIX
            this.ctx.clearRect(loc[0] + 5, loc[1] - 2, eraserDims[1] + 5, eraserDims[0] + 2);
        },
        // TODO: MARKERS
        chalk: function (loc, specifics) {
            let color = specifics.color;
            let width = specifics.width;
            let brushDiameter = width;
            let last = this.lastLoc;

            this.ctx.lineWidth = width;
            this.ctx.strokeStyle = 'rgba(' + color.join(",") + ',' + (0.4 + Math.random() * 0.2) + ')';
            this.ctx.beginPath();
            this.ctx.moveTo(last[0], last[1]);
            this.ctx.lineTo(loc[0], loc[1]);
            this.ctx.stroke();

            // Chalk Effect
            let length = Math.round(Math.sqrt(Math.pow(loc[0] - last[0], 2) + Math.pow(loc[1] - last[1], 2)) / (5 / brushDiameter));
            let xUnit = (loc[0] - last[0]) / length;
            let yUnit = (loc[1] - last[1]) / length;
            for (var i = 0; i < length; i++) {
                let xCurrent = last[0] + (i * xUnit);
                let yCurrent = last[1] + (i * yUnit);
                let xRandom = xCurrent + (Math.random() - 0.5) * brushDiameter * 1.2;
                let yRandom = yCurrent + (Math.random() - 0.5) * brushDiameter * 1.2;
                this.ctx.clearRect(xRandom, yRandom, Math.random() * 2 + 2, Math.random() + 1);
            }
        },
        pencil: function (loc, specifics) {
            let color = specifics.color;
            let width = specifics.width;
            let last = this.lastLoc;

            this.ctx.lineWidth = width;
            this.ctx.strokeStyle = "rgba(" + color.join(",") + ",1)";
            this.ctx.beginPath();
            this.ctx.moveTo(last[0], last[1]);
            this.ctx.lineTo(loc[0], loc[1]);
            this.ctx.stroke();
        }
    }




    this.init();
}
function Workspaces(PubblyScope) {
    // TODO: Replace all dom queries with PubblyScope.dom.whatever
    let workspaceDom = $("#pubbly_main #workspaces")[0];
    this.elems = [];
    // this.key = [];
    for (let p = 0; p < PubblyScope.data.pages.length; p++) {
        // this.key[p] = {};
        for (let o = 0; o < PubblyScope.data.pages[p].objs.length; o++) {
            let curObj = PubblyScope.data.pages[p].objs[o];
            if (curObj.type == "workspace") {
                PubblyScope.data.pages[p].objs[o].elem = this.elems.length;
                // this.key[p][curObj.name] = this.elems.length;

                this.elems.push(new Workspace(curObj, workspaceDom));
            }
        }
    }
}

