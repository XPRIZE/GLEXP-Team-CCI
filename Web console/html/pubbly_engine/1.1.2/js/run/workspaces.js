class Workspace {
    constructor(curObj, workspaceDom) {
        this.elem = document.createElement("canvas");
        this.elem.setAttribute("height", curObj.height);
        this.elem.setAttribute("width", curObj.width);
        this.elem.style.backgroundColor = "white";
        workspaceDom.append(this.elem);
        this.ctx = this.elem.getContext("2d");
        
        // Tester
        // this.ctx.fillRect(0,0,curObj.width,curObj.height);
    }
}

