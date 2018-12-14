//TODO: Max load timeout to kill page or something
function Buffer(PubblyScope, data) {
    const _Pubbly = PubblyScope;
    const _Buffer = this;

    this.assets = []; // ARRAY of all assets, keyed by src name (to avoid duplicate loads)
    // SET IN this.init
    this.pages = []; // array of all pages, complete with number of missing assets and a bool of "buffered" for quick checking and loading

    this.init = function () {
        // Called from firstLoad cb OR Buffer, Buf scope ensured either way
        for (let p = 0; p < data.pages.length; p++) {
            let curPage = data.pages[p];
            this.pages[p] = {
                loaded: false,
                assets: [],
            }
            for (let o = 0; o < curPage.objs.length; o++) {
                let curObj = curPage.objs[o];
                let srcPath = window.plurals[curObj.type]; // TODO: Add common source to minimize app deployment size.
                if (curObj.type == "gif" || curObj.type == "sequence") {
                    srcPath = "images";
                }

                let files;
                if (curObj.type == "sequence") {
                    files = curObj.frames;
                } else if (curObj.type == "field") {
                    files = []; // Fields have no "assets", should not be added to this.pages[p].assets array
                } else {
                    files = [curObj];
                }

                for (let f = 0; f < files.length; f++) {
                    if (files[f]) {
                        this.assets[files[f].fileName] = {
                            elem: false,
                            fileName: files[f].fileName,
                            src: files[f].src,
                            type: curObj.type,
                        }
                        this.pages[p].assets.push(this.assets[files[f].fileName]);
                    }
                }
            }
            for (let a = 0; a < curPage.auds.length; a++) {
                let curAud = curPage.auds[a];
                srcPath = curAud.src;
                this.assets[curAud.filename] = {
                    elem: false,
                    fileName: curAud.filename,
                    src: curAud.src,
                    type: "audio",
                };
                this.pages[p].assets.push(this.assets[curAud.filename]);
            }
        }
    }
    this.load = function (pageArr, cb) {
        if (pageArr.length === 0) {
            cb();
        } else {
            // if pages = [1,2,3], load sequentially and cb(). If pages = 1, load just the 1
            if (typeof pageArr === "object") {
                let pages = pageArr.slice();
                let THIS = this;
                function next() {
                    THIS.loadAct(pages[0], function () {
                        pages.shift();
                        if (pages[0]) {
                            next();
                        } else {
                            cb();
                        }
                    });
                }
                ;
                // self call loses scope
                next();
            } else {
                let page = pageArr * 1;
                this.loadAct(page, cb);
            }
        }
    }
    this.loadAct = function (page, cb) {
        if (this.pages[page].loaded === true) {
            cb();
        } else {
            let loaded = 0;
            let tot = this.pages[page].assets.length;
            function assetLoaded() {
                this.onload = false;
                this.oncanplaythrough = false;
                if (_Pubbly.runtimeProps.announceAssetLoad) {
                    console.log("INFO: " + this.src + " loaded in buffer");
                }

                loaded++;
                _Pubbly.progressGraph.blindCalculate();
                if (loaded == tot) {
                    // NOTE: _Buffer scope a little hacky... but this = img/audio and that might be useful.
                    _Buffer.pages[page].loaded = true;
                    if (cb) {
                        cb()
                    }
                }
            }
            if (this.pages[page].assets.length) {
                for (let a = 0; a < this.pages[page].assets.length; a++) {
                    // Why this confusing mess?
                    // Because I want to be able to reference assets by either a page specific array or their src string
                    // Since the page asset array is a reference to the source string (and NOT the other way around), setting elem props from this.assets will preserve the link, while setting elem props from this.pages[page].assets[a] will break the link

                    let fileName = this.pages[page].assets[a].fileName;
                    let asset = this.assets[fileName];
                    let loadEvent = "onload";
                    if (asset.type == "image" || asset.type == "sequence") {
                        asset.elem = new Image();
                    } else if (asset.type == "gif") {
                        asset.elem = document.createElement("video");
                        loadEvent = "oncanplaythrough";
                    } else if (asset.type == "audio") {
                        asset.elem = new Audio(); // POTENTIAL LEAK!
                        // Chome autoplays even though THIS
                        asset.autostart = 0;
                        // So... this. We set volume to 1 or globs.masterVol in sequence.js
                        asset.volume = 0;
                        /**
                         * Double check this I'm not sure BUT
                         * It is possible that deleting THIS only deletes JS references and NOT aud/img refernece
                         * Although, they haven't been attached to the DOM or anything, so I don't know why they wouldn't go with the rest of the obj
                         *
                         * And I'm too lazy to do any decent testing on this
                         * SO if you find yourself with another shitty slow engine, check here first. And second or whatever you'll probably have more leaks
                         */
                        loadEvent = "oncanplaythrough"
                    }
                    asset.elem.setAttribute("class", "asset");
                    asset.elem[loadEvent] = assetLoaded;
                    asset.elem.onerror = function () {
                        console.error("Bad image load for: ");
                        console.error(this);
                        fatalProductionError("Missing asset");
                    }; //TODO: Make function
                    if (_Pubbly.runtimeProps.artificialLoadTime) {
                        window.setTimeout(function () {
                            asset.elem.setAttribute("src", asset.src);
                        }, _Pubbly.runtimeProps.artificialLoadTime);
                    } else {
                        asset.elem.setAttribute("src", asset.src);
                    }
                }
            } else {
                cb();
            }
        }
    }

    this.unload = function (page) {
        console.log(page);
    }

    this.init();
}
