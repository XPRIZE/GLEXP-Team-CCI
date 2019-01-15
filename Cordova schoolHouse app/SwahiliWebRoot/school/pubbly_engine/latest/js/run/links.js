function Links(pubblyScope) {
    const _Pubbly = pubblyScope;
    const _Links = this;

    // Functions for easy future debugging
    this.testing = {
        outlineAllLinksOnPage: function (p) {
            if (p === null) {
                p = _Pubbly.curPage;
            }
            for (let l = 0; l < this.links[p].length; l++) {
            }
        }
    };

    this.getLinksOnPage = function (curPage = _Pubbly.curPage) {
        // Graphic
        let links = [];
        let graphicLinks = _Pubbly.data.pages[curPage].links.graphic;
        for (let l = 0; l < graphicLinks.length; l++) {
            links.push(graphicLinks[l]);
        }
        // TODO: Add other links (drag? Is that another link type?)
        return links;
    };
    // Returns the first link below the given mouse/touch loc
    this.checkLocForLinks = function (loc, priority, curPage = _Pubbly.curPage) {
        // loc: [ptx,pty], returns first hit or false
        // priority: Gonna have to be something sticky... Cause if you're draggin, you want drop links to take priority, and if you're drawing a line, you want lineend links to be priority... I'm thinking trigger type. In any case, we get ALL possible links, then toss the disabled, then do something with priority.
        let caught = [];

        let links = this.getLinksOnPage(curPage);
        for (let l = 0; l < links.length; l++) {
            let link = links[l];
            if (inside(loc, link.poly)) {
                caught.push(link);
            }
        }

        // filter out the disabled links
        caught = caught.filter(function (link) {
            if (link.enabled) {
                return link;
            } else {
                return false;
            }
        });
        // TODO: caught.sort in some way that accounts for piroty

        return (caught[0]) ? caught[0] : false;
    };

    this.init = function () {
        let linksMade = 0; // ALL links added from XML
        let totLinks = 0;

        for (let p = 0; p < _Pubbly.data.pages.length; p++) {
            let curPage = _Pubbly.data.pages[p];

            /*
             this.links[p] = [];
             // Each link type by it's own loop
             for (let gl = 0; gl < curPage.links.graphic.length; gl++, linksMade++) {
             let curLink = curPage.links.graphic[gl];
             this.links[p].push(curPage.links.graphic[gl]); // linked not duped
             }
             
             
             
             for (var key in curPage.links.keys) {
             totLinks++;
             }
             */
        }

        // Another check, one in XML already
        if (linksMade !== totLinks) {
            error("log", "Link creation", "Some of the links described in the XML were not made. Most likely unrecognized type");
        }
    };
    this.init();
}
