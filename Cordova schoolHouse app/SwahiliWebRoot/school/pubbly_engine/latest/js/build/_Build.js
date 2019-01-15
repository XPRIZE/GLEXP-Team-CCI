function Build(props) {
    const _Build = this;

    this.buildPostSpecs = props.buildPostSpecs;
    this.buildPostLoc = props.buildPostLoc;
    this.bookLoc = props.bookLoc;
    this.xmlName = props.xmlName;
    this.engineCode = props.engineCode;

    this.artificialLoadTime = 0;
    this.successCB = props.success;
    this.errorCB = props.error;

    // this.buildDOM = new BuildDOM(this);
    /* 
     * TODO: Big ass job, combine firstload.js and buffer into one super object
     * but generalized, so it can be used for both page buffering and firs tcheck shits
     */
    // this.buffer = new Buffer(this);
    // this.firstLoad = new FirstLoad(this);

    // this.xmlToJson = new XmlToJson(this);
    let bLoc = this.bookLoc;

    window.preflight = new buildDOM();
    updateJsonFromXML(window.preflight.progress, this.bookLoc + "/" + this.xmlName, function (xml) {
        xml.pages.map(page => {
            page.objs.map(obj => {
                if (obj.type == "image") {
                    obj.relPath = bLoc + "/images/" + obj.fSrc;
                } else if (obj.type == "gif") {
                    obj.relPath = bLoc + "/images/" + obj.fileName + "." + obj.ext;
                } else if (obj.type == "video") {
                    obj.relPath = bLoc + "/videos/" + obj.fileName + "." + obj.ext;
                } else if (obj.type == "sequence") {
                    obj.frames.map(frame => {
                        frame.relPath = bLoc + "/images/" + frame.dSrc;
                    });
                }
            });
            page.auds.map(aud => {
                aud.relPathNoExt = bLoc + "/audio/" + aud.fName;
            });
        });
        let FirstLoadBuffer = new PubblyPageBuffer(xml);
        FirstLoadBuffer.loadMultiplePages(Object.keys(xml.pages), {
            prog: window.preflight.progress.calculate,
            fail: function (message) {
                window.preflight.progress.say(message);
            },
            done: function () {
                if (_Build.buildPostSpecs) {
                    $.ajax({
                        url: _Build.buildPostLoc,
                        type: 'post',
                        data: {
                            data: btoa(JSON.stringify(xml)),
                            buildPostSpecs: _Build.buildPostSpecs,
                        },
                        error: function (ret) {
                            console.log(ret);
                            error("fatal", "Buffer", "Problem writting JSON after firstLoad. No writeBookJson ajax script found");
                        },
                        success: function (ret) {
                            if (ret.status == "success") {
                                console.info("Preload all worked and json wrote.");
                                console.info("---------------------------------------------");
                                window.preflight.kill();
                                _Build.successCB(xml);
                            } else if (ret.status == "error") {
                                error("fatal", "Buffer", "Problem writting JSON after firstLoad. Message: " + ret.message);
                            } else {
                                document.body.innerHTML = ret;
                            }
                        },
                    });
                } else {
                    _Build.successCB(xml);
                }
            }
        });
    });
}