class DomInteractionCover {
    promptClick(cb) {
        let height = this.container.height();
        let width = this.container.width();
        this.container.append(`
         <div class='domInteractionCoverCont' 
         style='position:absolute;height:${height}px;width:${width}px;background-color:white'> 
         <img src="${this.picked.relPath}"
         class='transformCenter cursor-pointer'
         style='max-height: 100%' 
         loop=infinite />
         </div>`);
        this.cb = cb;
        this.container[0].addEventListener("click", this.clicked);
    }

    clicked() {
        this.container.find(".domInteractionCoverCont").remove();
        this.container[0].removeEventListener("click", this.clicked);
        this.cb();
        this.cb = false;
    }

    constructor(container) {
        this.container = container;
        this.clicked = this.clicked.bind(this);
        
        this.cb = false;
        this.available = [
            "Bee_exit2.gif",
            "Bee_loop_fast.gif",
            "Mathazzar-Loading.gif",
            "bird_jump_loop2.gif",
            "word_pup_screen_gif_03.gif",
            "wordtopia5.gif",
        ].map(e => {
            return {
                type: "gif",
                relPath: "pubbly_engine/shared/domInteractionCover/" + e
            }
        });
        this.picked = randInArray(this.available);
    }
}

/*
 * let domInteractionCovers = [
 "Bee_exit2.gif",
 "Bee_loop_fast.gif",
 "Mathazzar-Loading.gif",
 "bird_jump_loop2.gif",
 "word_pup_screen_gif_03.gif",
 "wordtopia5.gif",
 ];
 let cover = domInteractionCovers[rand(domInteractionCovers.length - 1)];
 */