/*
Main entrance function for the pubbly BUILD process, which takes XML
    (Either a full backticked XML string, for cross domain workaround) OR
    (The name and path to an XML file)
And converts to a JSON data structure, for better speeds and resuability

The JSON may get posted to a server script via ajax (buildPostSpecs and buildPostLoc)
OR it can just be echoed directly into the _Pubbly.json entrance function (for quick previewing or testing)

*/

function Build(props, cbs) {
    const _Build = this;
    // utilities/something

    // stripNoReplaceProps removes any of the properties that were not replaced in the html frag system
    // THIS DOES NOT WORK if the property value was a JSON object, like the post specs
    // Come up with better check in strip func
    // props = stripNoReplaceProps(props);
    this.props = Object.assign({
        buildPostSpecs: false,
        buildPostLoc: false,
        bookLoc: ".",
        xmlName: "MainXML.xml",
        engineCode: "development",
        xmlStr: false,
        rootToEngine: "",
        skipBuild: false,
        environment: "online",
    }, props);
    this.cbs = Object.assign({
        done: function () { },
        prog: function () { },
        fail: function () { },
    }, cbs);
    this.artificialLoadTime = 0;

    // HOT fix, for when the offline build places the index AT LOCATION, and the beginning / makes the browser think we're looking at the start of the damn drive
    if (this.props.bookLoc === "") {
        this.props.bookLoc = ".";
    }

    /* 
     * TODO: Big ass job, combine firstload.js and buffer into one super object
     * but generalized, so it can be used for both page buffering and firs tcheck shits
     */

    let preflight = new Preflight({
        rootToEngine: this.props.rootToEngine,
    });
    function xmlRecieved(xmlDoc) {
        updateJsonFromXML(xmlDoc, {
            fail: function () {
                preflight.say("ERROR: XML was not successfully parse. Please double check that a zip file has been uploaded via the admin tools");
            },
            prog: preflight.progressGraph,
            done: function (json) {
                json.pages.map(page => {
                    page.objs.map(obj => {
                        if (obj.type == "image") {
                            obj.relPath = _Build.props.bookLoc + "/images/" + obj.fSrc;
                        } else if (obj.type == "gif") {
                            obj.relPath = _Build.props.bookLoc + "/images/" + obj.fileName + "." + obj.ext;
                        } else if (obj.type == "video") {
                            obj.relPath = _Build.props.bookLoc + "/videos/" + obj.fileName + "." + obj.ext;
                        } else if (obj.type == "sequence") {
                            obj.frames.map(frame => {
                                frame.relPath = _Build.props.bookLoc + "/images/" + frame.dSrc;
                            });
                        }
                    });
                    page.auds.map(aud => {
                        aud.relPathNoExt = _Build.props.bookLoc + "/audio/" + aud.fName;
                        aud.name = aud.fName;
                    });
                });
                if (_Build.props.skipBuild) {
                    preflight.kill();
                    _Build.cbs.done(json);
                } else {
                    preflight.check(json,
                        {
                            fail: _Build.cbs.fail,
                            done: function (json) {
                                // JSON has been altered by hotfixUI maybe
                                if (_Build.props.buildPostSpecs) {
                                    $.ajax({
                                        url: _Build.props.buildPostLoc,
                                        type: 'post',
                                        data: {
                                            data: btoa(JSON.stringify(json)),
                                            buildPostSpecs: _Build.props.buildPostSpecs,
                                        },
                                        error: function (ret) {
                                            console.log(ret);
                                            error("fatal", "Buffer", "Problem writting JSON after firstLoad. No writeBookJson ajax script found");
                                        },
                                        success: function (ret) {
                                            if (ret.status == "success") {
                                                console.info("Preload all worked and json wrote.");
                                                console.info("---------------------------------------------");
                                                preflight.kill();
                                                _Build.cbs.done(json);
                                            } else if (ret.status == "error") {
                                                error("fatal", "Buffer", "Problem writting JSON after firstLoad. Message: " + ret.message);
                                            } else {
                                                document.body.innerHTML = ret;
                                            }
                                        },
                                    });
                                } else {
                                    preflight.kill();
                                    _Build.cbs.done(json);
                                }
                            }
                        });
                }
                // let FirstLoadBuffer = new PubblyPageBuffer(json);
                // FirstLoadBuffer.loadMultiplePages(Object.keys(json.pages), {});
            }
        });
    }

    if (this.props.xmlStr) {
        let xmlDoc = false;
        try {
            xmlDoc = $.parseXML(this.props.xmlStr);
        } catch (e) {
            alert("Error: Could not parse XML. Please make sure it is good.");
        }
        if (xmlDoc) {
            xmlRecieved(xmlDoc);
        }
    } else {
        $.get(_Build.props.bookLoc + "/" + this.props.xmlName + "?" + rand(0, 100000)).success(function (xmlDoc) {
            xmlRecieved(xmlDoc);
        }).fail(function (err) {
            preflight.say("ERROR: XML not found. Please double check that a zip file has been uploaded via the admin tools");
        });
    }
}
