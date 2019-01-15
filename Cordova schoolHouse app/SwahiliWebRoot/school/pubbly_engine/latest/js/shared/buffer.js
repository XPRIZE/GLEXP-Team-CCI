class PubblyPageBuffer {
    // Load the specified page
    loadPage(p, cbs) {
        // p >>> page number to load
        // cbs >>> {done: cb, fail: cb, prog: cb}
        if (this.checkPageExists(p)) {
            this.assetListLoaders[p].load(this.assets[p], cbs);
        } else {
            console.error("PubblyPageBuffer.loadPage: Page " + p + " not found");
        }
    }
    // Unload all assets from specified page
    unloadPage(p) {
        if (this.checkPageExists(p)) {
            this.assetListLoaders[p].unload(this.assets[p]);
        } else {
            console.error("PubblyPageBuffer.loadPage: Page " + p + " not found");
        }
    }

    loadMultiplePages(pages, cbs) {
        cbs = assignDefaultCallbacks(cbs);
        // pages >>> [2, 3, 4, 5] will load in that order
        // cbs >>> {done: cb, fail: cb, prog: cb}
        // cbs.prog() >>> Will call back with calculated order (prog/pages.length)
        let totalPages = pages.length;
        let totalAssets = 0;
        pages.map(p => {
            let pCount = this.getPageUnloadedAssetCount(p);
            totalAssets += pCount;
        });
        let nextPageFunc = function () {
            let nextPage = pages.shift();
            if (typeof nextPage !== "undefined") {
                this.loadPage(nextPage,
                        {
                            done: nextPageFunc,
                            fail: cbs.fail,
                            prog: function (decimal) {
                                let at = decimal;
                                let pagesLoaded = totalPages - pages.length;
                                let pageAdjustment = (pagesLoaded - 1 + at) / totalPages;
                                // Not an idea calculate, but does the job.
                                /** Improvements:
                                 * Page 0 has 2 assets, page 1 has 100.
                                 * Progress will go 25%, 50%, 50.5%...
                                 * FIX: Calculate based on total assets left vs total assets ON PAGE loaded
                                 */
                                cbs.prog(pageAdjustment);
                            },
                        });
            } else {
                cbs.done();
            }
        }.bind(this);
        if (totalAssets) {
            nextPageFunc();
        } else {
            cbs.done();
        }

    }

    getPageUnloadedAssetCount(p) {
        // returns the number of assets on a given page
        // ['path/to/1.jpg', 'path/to/2.jpg']
        let assetsOnPage = this.assets[p].map((a) => a.relPath);
        // ['path/to/1.jpg']
        let assetsLoaded = Object.keys(this.assetListLoaders[p].keys);
        // Difference between the two >>> ['path/to/2.jpg']
        // utility/findDifferenceBetweenTwoArrays.js
        return findDifferenceBetweenTwoArrays(assetsOnPage, assetsLoaded).length;
    }
    checkPageLoaded(p) {
        return false;
    }
    // Checks to see if the page references has assets, and an AssetListLoader
    checkPageExists(p) {
        return (this.assetListLoaders[p] && this.assets[p]);
    }
    constructor(data) {
        this.loadPage = this.loadPage.bind(this);
        this.unloadPage = this.unloadPage.bind(this);
        this.getPageUnloadedAssetCount = this.getPageUnloadedAssetCount.bind(this);

        // Array of AssetList elements
        this.assetListLoaders = [];
        // Array of actual assets on page i
        this.assets = [];

        for (let p = 0; p < data.pages.length; p++) {
            // Add audios
            let audLoads = data.pages[p].auds.map(aud => {
                if (aud.relPath) {
                    // Audio has been found by previous run
                    return {type: "audio", relPath: aud.relPath};
                }   else if (aud.relPathNoExt) {
                    return {type: "audio", relPath: aud.relPathNoExt};
                }   else {
                    console.error("PubblyPageBuffer.constructor: Cannot load audio, does not have relPath or relPathNoExt");
                }
            });
            let imgLoads = [];
            let gifLoads = [];
            let vidLoads = [];
            data.pages[p].objs.forEach(function (obj) {
                if (obj.type == "image") {
                    imgLoads.push({type: "image", relPath: obj.relPath});
                } else if (obj.type == "sequence") {
                    obj.frames.forEach(function (frame) {
                        imgLoads.push({type: "image", relPath: frame.relPath});
                    });
                } else if (obj.type == "video") {
                    vidLoads.push({type: obj.type, relPath: obj.relPath});
                } else if (obj.type == "gif") {
                    gifLoads.push({type: obj.type, relPath: obj.relPath});
                }
            });
            this.assetListLoaders[p] = new AssetListLoader();
            this.assets[p] = imgLoads.concat(audLoads).concat(gifLoads).concat(vidLoads);
        }
    }
}