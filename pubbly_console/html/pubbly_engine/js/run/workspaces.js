/*
    Was hoping to get more out of _Pubbly and into this, but alas,

    Workspaces are the "lets let the kids draw on pages" idea, which required the Drawing tools (which actually were pretty well broken out)

    Each workspace needs it's own non-dom canvas, and on page_draw events, I loop through each work space, get a snapshot of the CTX, and draw directly to the MAIN pubbly page CTX.

    Low low cost.
*/
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

