class Workspace {
    constructor(curObj, workspaceDom) {
        this.elem = document.createElement("canvas");
        this.elem.setAttribute("height", curObj.height);
        this.elem.setAttribute("width", curObj.width);
        this.elem.style.backgroundColor = "white";
        workspaceDom.append(this.elem);
        this.ctx = this.elem.getContext("2d");
        
        this.data = false;
        /*
        if (curObj.name == "Workspace 1") {
            document.body.appendChild(this.elem);
            $(this.elem).css({"top": "183px", "right": 0, "position": "absolute", "background-color": "grey"});
        }
        */
        
        // Tester
        // this.ctx.fillRect(0,0,curObj.width,curObj.height);
    }
}

