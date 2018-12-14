function DomInteractionCover(container, gifSrc, interactedCB) {
    const _DomInteractionCover = this;
    this.container = container;
    this.interactedCB = interactedCB;

    this.container.append("<div class='domInteractionCoverCont' style='height:100%;width:100%;background-color:white'></div>");
    this.cont = this.container.find(".domInteractionCoverCont")[0];
    this.cont.append(gifSrc);
    $(gifSrc).addClass("transformCenter");
    $(gifSrc).addClass("cursor-pointer");
    $(gifSrc).css({"max-height":"calc(100% - 100px", "max-width": "100%"});
    // Sets to loop=loop? no idea
    //$(gifSrc).attr("loop", "infinite");
    $(gifSrc)[0].setAttribute("loop", "infinite");
    $(gifSrc).click(function () {
        $(this).parent().remove();
        _DomInteractionCover.interactedCB();
    });
}