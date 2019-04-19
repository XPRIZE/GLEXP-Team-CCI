/*
    Way to buffer all assets for next page.

    This actually got way more use than it deservers, or it needs to be built out a little further. Turns out when you allow designers to put as many objects on a page as they want, you end up having to buffer something like 500+ assets (images/audio files) per page
    And that's somewhat OK for the android APK because it's all local, although even there you can get a slowdown from just the loading to RAM alone,

    For serverside previews, this poor puppy needs some more attension.

    But basically... Each pubbly needs to buffer at least 1 page out in either direction So if you're on page 2-3, you need to have page 1 loaded along with page 4-5.

    And ideally you want a 2 page lead (load page 6-7 as well) so kids can turn fast and still not get a "loading plz wait lol" screen

    So each "page" is loaded individually, and each page is about a million billion assets, which all get sent off to the asset list loader function to load sequentially

    And once all the assets for the page have finished, you get a call back and you load the next page in the "we need this" list, until you've loaded everything you need to DRAW the current page, and everything else is just a would be nice to have.
    
*/

class PubblyPageBuffer {
    // Load the specified page
    loadPage(p, cbs) {
        // p >>> page number to load
        // cbs >>> {done: cb, fail: cb, prog: cb}
        if (this.checkPageExists(p)) {
            this.assetListLoaders[p].loadList(this.assets[p], cbs);
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
        // Only need to load pages with unloaded assets
        pages = pages.filter(p => {
            let pCount = this.getPageUnloadedAssetCount(p);
            totalAssets += pCount;
            return pCount;
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