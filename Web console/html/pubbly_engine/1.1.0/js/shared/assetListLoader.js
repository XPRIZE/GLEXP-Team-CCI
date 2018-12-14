/*
 * HOW TO USE
 * // Example assets. Need a relPath, and a type
 * let asset1 = {relPath: "books/21/audio/sfx_wooman_cooing.wav", type: "audio"}
 * let asset2 = {relPath: "books/21/images/blanketcover.png", type: "image"}
 * 
 * // Assets can also be vague... i.e., their extention is unknown
 * let asset3 = {relPath: "books/21/audio/sfx_boy_sneeze", type: "audio"}
 * let asset4 = {relPath: "books/21/images/CBM_00_cowboy13", type: "image"}
 * 
 * let al = new AssetListLoader();
 * 
 * // You can load assets individually
 * al.load(
 *     asset1, 
 *     {
 *         done: console.log.bind(null, "done")
 *         fail: console.error.bind(null)
 *     }
 * )
 * 
 * // You can load assets in a list
 * al.load(
 *     [
 *         asset1,
 *         asset2
 *     ],
 *     {
 *         done: console.log.bind(null, "done")
 *         fail: console.error.bind(null)
 *     }
 * )
 * 
 * // Your individual / list item assets can be specific or vague
 * al.load(
 *     [
 *         asset1,  *  knows the ext
 *         asset2,
 *         asset3,  *  doesn't know the ext, will search for all available exts of asset type
 *         asset4
 *     ],
 *     {
 *         done: console.log.bind(null, "done")
 *         fail: console.error.bind(null)
 *     }
 * )
 * 
 * // AssetListLoader.load will fail if ANY of the assets are missing
 * // BUT it will always check the full list, to give you a complete "missing" report
 * al.load(
 *     [
 *         {relPath:"broken", type:"image"},
 *         asset1, 
 *         asset2,
 *         asset3,
 *         asset4
 *     ],
 *     {
 *         done: console.log.bind(null, "done")
 *         fail: console.error.bind(null)
 *     }
 * )
 * 
 * // Assets can be found at their relPath keys
 * al.load(
 *     [
 *         {relPath: "books/21/audio/sfx_wooman_cooing.wav", type: "audio"}
 *     ],
 *     {
 *         done: console.log.bind(null, "done")
 *         fail: console.error.bind(null)
 *     }
 * )
 */

class AssetListLoader {
    // Public
    load(assets, cbs) {
        // Asset >> {type, relPath} || [{type, relPath},{type, relPath}]
        // cbs >> {done: (), fail: (errMessage), prog: (decimal)},
        cbs = assignDefaultCallbacks(cbs);
        if (typeof assets.length == "undefined") {
            this.loadSingleSpecificOrVagueAsset(assets, cbs);
        } else {
            let found = 0;
            let missing = 0;
            let total = assets.length;
            let checkList = function (asset) {
                // assets = assets.filter((check) => check !== asset);
                if (found == total) {
                    cbs.done();
                } else {
                    if (found + missing == total) {
                        let wanted = assets.map(e => e.relPath);
                        let missing = wanted.filter(w =>
                            typeof this.keys[w] === "undefined", this);
                        cbs.fail("Missing the following assets: " + missing.join(", "));
                    } else if (cbs.prog) {
                        cbs.prog((found + missing) / total);
                    }
                    nextAsset();
                }
            }.bind(this);
            // TODO: Clean, but keep as "load in sequence", not "LOAD WHOLE BLOCK"
            // Weird chrome error... callbacks hold after a certain number in chain.
            let a = -1;
            let nextAsset = function () {
                a++;
                let asset = assets[a];
                window.setTimeout(function () {
                    this.load(asset,
                            {
                                done: function () {
                                    found++;
                                    checkList(asset);
                                },
                                fail: function () {
                                    missing++;
                                    checkList(asset);
                                }
                            }
                    );
                }.bind(this), 1);
            }.bind(this);
            nextAsset();
        }
    }

    unload(assets) {
        // Asset >> {type, relPath} || [{type, relPath},{type, relPath}]
        if (typeof assets.length == "undefined") {
            this.unloadSingle(assets);
        } else {
            // TEST
            assets.forEach(asset => this.unloadSingle(asset));
        }
    }

    unloadSingle(relPath) {
        if (this.keys[relPath] && this.keys[relPath].elem) {
            this.keys[relPath].elem = null;
            delete this.keys[relPath];
        } else {
            if (typeof relPath == "string") {
                console.warn("Asset.removeLoadedAsset: Cannot find asset with relPath of " + relPath);
            } else {
                console.warn("Asset.removeLoadedAsset: Bad call. Call with the relPath string of the asset you wish to remove");

            }

        }
    }

    // All else private, called with a single asset
    loadSingleSpecificOrVagueAsset(asset, cbs) {
        // asset >> {type, relPath}
        // asset.type = ["image", "audio", "gif", "video"]
        // asset.relPath (specific) = ["dog.png", "bark.wav"]
        // asset.relPath (vague) = ["dog", "bark"]
        let supportedExts = {
            "image": ["png", "jpg", "jpeg"],
            "audio": ["ogg", "mp3", "wav"],
            "video": ["mp4", "avi"],
            "gif": ["gif"],
        }
        if (typeof asset.type !== "undefined" &&
                typeof supportedExts[asset.type] !== "undefined" &&
                typeof asset.relPath !== "undefined") {
            // dog.justkidding.wav, asset.ext is wav
            // dog, asset.ext is false
            asset.ext = (asset.relPath.split(".").length > 1) ?
                    getExtFromPath(asset.relPath) : false;
            if (asset.ext === false) {
                // ["wav", "ogg", "mp3"]
                let possibleExts = supportedExts[asset.type].slice();
                // ["dog.wav", "dog.ogg", "dog.mp3"]
                asset.possibles = possibleExts.map(e => asset.relPath + "." + e);
                this.searchForVagueAsset(asset, cbs);
            } else if (supportedExts[asset.type].indexOf(asset.ext) !== -1) {
                this.download(asset, cbs);
            } else {
                console.error("AssetListLoader.loadSingleSpecificOrVagueAsset: Asset ext not supported. Please only use " + supportedExts[asset.type].join(",") + " files for " + asset.type + " files.");
                cbs.fail();
            }
        } else {
            console.error("AssetListLoader.loadSingleSpecificOrVagueAsset: Asset " + JSON.stringify(asset) + " does not have a type and relPath, cannot load.");
            cbs.fail();
        }
    }

    addLoadedAsset(asset) {
        this.keys[asset.relPath] = asset;
        // utility/filePathManipulations.js
        this.byFileSource[getFileSourceFromPath(asset.relPath)] = this.keys[asset.relPath];
        this.byFileName[getFileNameFromPath(asset.relPath)] = this.keys[asset.relPath];
    }
    download(asset, cbs) {
        let loadEvent = "load";
        if (asset.type == "image" || asset.type == "gif") {
            asset.elem = new Image();
        } else if (asset.type == "audio") {
            asset.elem = new Audio();
            // Chome autoplays even though THIS
            asset.elem.autostart = 0;
            // So... this. We set volume to 1 when we play it. In sequence.js
            asset.elem.volume = 0;
            loadEvent = "canplaythrough";
        }
        /* Full explanation of this.
         * 
         * So why not just bind to an anon function?
         * Because anon functions can't be removed as event listeners
         * Why not just bind to a declared method in the class?
         * Because bounded functions are new functions, created from the original. But you can't remove the eventlistener with a refernce to a function used to create the bounded function, because they ain't the same no more.
         * 
         * Solution?
         * Pre ES6 this-that.
         * 
         */
        let that = this;
        asset.elem.addEventListener(loadEvent, function loaded() {
            asset.elem.removeEventListener(loadEvent, loaded);
            that.addLoadedAsset(asset);
            cbs.done();
        });
        asset.elem.onerror = cbs.fail;
        asset.elem.setAttribute("src", asset.relPath);
    }

    searchForVagueAsset(asset, cbs) {
        // possible >> ["dog.wav", "dog.ogg", "dog.mp3"]
        let check = asset.possibles.shift();
        if (check) {
            asset.relPath = check;
            this.download(asset, {
                done: function () {
                    // Cleanup
                    delete asset.possibles;
                    cbs.done();
                },
                fail: this.searchForVagueAsset.bind(this, asset, cbs)
            });
        } else {
            asset.relPath = changeExtFromPath(asset.relPath, "*");
            cbs.fail();
        }
    }

    constructor() {
        this.load = this.load.bind(this);
        this.unload = this.unload.bind(this);
        this.loadSingleSpecificOrVagueAsset = this.loadSingleSpecificOrVagueAsset.bind(this);
        this.addLoadedAsset = this.addLoadedAsset.bind(this);
        this.download = this.download.bind(this);
        this.searchForVagueAsset = this.searchForVagueAsset.bind(this);

        this.keys = {
            
        };
        this.byFileSource = {};
        this.byFileName = {};
    }
}
