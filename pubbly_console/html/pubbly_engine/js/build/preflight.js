class Preflight {
    check(json, cbs) {
        /* Main preflight use function... 
         * Runs through a number of checks: 
         *  - makes sure all assets are present
         *  - makes sure JSON makes sense? maybe later
         * Presents authors with overrides to global json properties:
         *  - Allow/Disallow interruptions
         *  - Enables/Disables save states
         *  - Set all fields to known font
         * Calls back to "done" which goes back to _Build and saves the json on the server (if post specs)
         */
        this.cbs = assignDefaultCallbacks(cbs);
        this.check_allAssetsPresent(json, {
            done: function() {
                this.progressGraph.set(100);
                this.progressGraph.kill();
                // On no wait nevermind we IMMEDIATELY need it again
                /*
                if (this.environment === "console") {
                    this.cbs.done(json);
                }   else    {
                    this.hotfixUI = new hotfixUI(json, this.cbs);
                }
                */
                this.hotfixUI = new hotfixUI(json, this.cbs);
            }.bind(this),
            prog: function(at) {
                this.progressGraph.calculate(at);
            }.bind(this),
            fail: function(message, missing) {
                this.progressGraph.set(100);
                this.progressGraph.kill();
                // missing assets...
                // flag each object that depends on missing assets in json
                // Pass json to hotfixUI, it loops to find which assets to echo
                // Ignoring missing assets removes objs from flags
                json.pages.map(page => {
                    page.objs.map(obj => {
                        if (missing.indexOf(obj.relPath) !== -1) {
                            if (obj.type === "video") {
                                obj.relPath = this.props.rootToEngine + "assets/blank_video.mp4";
                                obj.fSrc = "blank_video.mp4";
                                obj.fName = "blank_video";
                                obj.missing = true;
                            }   else if (obj.type === "image") {
                                obj.relPath = this.props.rootToEngine + "assets/blank_image.png";
                                obj.fSrc = "blank_image.png";
                                obj.fName = "blank_image";
                                obj.missing = true;
                            }
                        }
                    });
                    page.auds.map(aud => {
                        if (missing.indexOf(aud.relPath) !== -1
                            || missing.indexOf(aud.relPathNoExt) !== -1) {
                            aud.relPathNoExt = this.props.rootToEngine + "assets/blank_audio";
                            aud.relPath= this.props.rootToEngine + "assets/blank_audio.mp3";
                            aud.fName = "blank_audio";
                            aud.fSrc = "blank_audio.mp3";
                            aud.ext = "mp3";
                            aud.missing = true;
                        }
                    });
                });
                this.hotfixUI = new hotfixUI(json, this.cbs);
            }.bind(this),
        });
    }
    check_allAssetsPresent(json, cbs) {
        this.progressGraph.say("Checking assets on server");
        cbs = assignDefaultCallbacks(cbs);
        let FirstLoadBuffer = new PubblyPageBuffer(json);
        FirstLoadBuffer.loadMultiplePages(Object.keys(json.pages), {
            done: cbs.done,
            prog: cbs.prog,
            fail: cbs.fail
        });
    }
    say() {
        console.log("test");
    }
    kill() {
        $("#preflight_cont").remove();
    }
    kill_progress() {
        this.progressGraph.kill();
    }
    kill_hotfixUI(props, cbs) {
        this.hotfixUI.kill()
    }

    constructor(props) {
        this.props = Object.assign({
            height: 400,
            width: 800,
            rootToEngine: "",
        }, props);
        this.dom = $("#pubbly_main").append(`
            <div id='preflight_cont' style='height:${this.props.height}px;width:${this.props.width}px;'>
            <div style='height:${this.props.height}px;width:${this.props.width}px;position:absolute;'>
            <div id='preflight_load_cont' class='loader'>
            </div>
            </div>
            </div>
            `);
        if ($("#pubbly_main")) {
            $("#pubbly_main").css("opacity",1);
        }
        this.progressGraph = new ProgressGraph("vertical_letters_preflight", $("#preflight_load_cont"));
    }
}
