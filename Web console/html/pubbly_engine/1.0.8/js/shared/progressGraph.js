function ProgressGraph(type, container) {
    this.elem = false;

    // Load 15 assets on page 1 and 5 on page 2...
    // Need a way to set TOTAL load count, not page specific
    this.globalAt = false;
    this.globalLeft = false;
    this.messyLoader = {
        vertical_letters: {
            // Actual HTML to echo into the container
            html: `
                <div class='transformCenterCont'>
                    <div class='transformCenter'>
                        <style>
                            .loadColorsCont {
                                position:absolute;
                                height:calc(100% - 4px);
                                margin-top:2px;
                                width:100%;
                            }
                            .loadColor {
                                position:absolute;
                                bottom:0;
                                height:0%;
                                /* This fixes overflow line prob */
                                margin-left:1px;
                                width:calc(${100 / 6}% - 2px);
                                /* Added transition for smoother fill */
                                transition-duration:0s;
                                transition-timing-function:linear;
                            }
                            .loadColor[letter=p] {
                                background-color:#${pubColor("purple", "hex")};
                                left:${(100 / 6) * 0}%;
                            }
                            .loadColor[letter=u] {
                                background-color:#${pubColor("blue", "hex")};
                                left:${(100 / 6) * 1}%;
                            }
                            .loadColor[letter=b1] {
                                background-color:#${pubColor("orange", "hex")};
                                left:${(100 / 6) * 2}%;
                            }
                            .loadColor[letter=b2] {
                                background-color:#${pubColor("red", "hex")};
                                left:${(100 / 6) * 3}%;
                            }
                            .loadColor[letter=l] {
                                background-color:#${pubColor("lightblue", "hex")};
                                left:${(100 / 6) * 4}%;
                            }
                            .loadColor[letter=y] {
                                background-color:#${pubColor("green", "hex")};
                                left:${(100 / 6) * 5}%;
                            }
                            .loadColor.errored {
                                background-color:#${pubColor("red", "hex")};
                                animation: pulse 1s infinite;
                                animation-direction: alternate;
                            }
                            @keyframes pulse {
                                0%   {
                                     background-color:#${pubColor("red", "hex")};
                                }
                                100% { 
                                     background-color:#${pubColor("darkred", "hex")};
                                }
                            }
                            .positionImg, .displayImg {
                                max-width:500px;
                            }
                            .positionImg {
                                visibility:hidden;
                            }
                            .displayImg {
                                position:absolute;
                                top:0;
                                z-index:5;
                                /* This to cover the little line of position rounding */
                                /* NOT WORKING, because the bg blocks the colors. Stupid
                                 * padding:50px;
                                 * margin:-50px;
                                 * background-color:white;
                                 */
                            }
                            .text_cont {
                                height:0;
                                margin:0;
                            }
                            .loader_text {
                                position:absolute;
                                width:100%;
                                text-align:center;
                                font-size:24px;
                                color:#3B4D83;
                                /* Known load height, this can be fixed */
                                max-height:180px;
                                overflow-x:hidden;
                                overflow-y:scroll;
                            }
                            .loader_confirm {
                                position:absolute;
                                width:100px;
                                height:40px;
                                left:50%;
                                margin-left:-50px;
                                margin-top:-50px;
                            }
                            .loader_confirm.hide {
                                visibility:hidden
                            }
                        </style>
                        <button class='loader_confirm hide'>Text</button>
                        <div class='loadColorsCont'>
                            <div class='loadColor' letter='p'></div>
                            <div class='loadColor' letter='u'></div>
                            <div class='loadColor' letter='b1'></div>
                            <div class='loadColor' letter='b2'></div>
                            <div class='loadColor' letter='l'></div>
                            <div class='loadColor' letter='y'></div>
                        </div>
                        <!-- One image for positioning (make cont size of img) -->
                        <img class='positionImg' src='pubbly_engine/shared/logos/logoEmptyColors.png' />
                        <!-- The other to actually display, and overlay the colored blocks below -->
                        <img class='displayImg' src='pubbly_engine/shared/logos/logoEmptyColors.png' />
                        <div class='text_cont'>
                            <p class=loader_text></p>
                        </div>
                    </div>
                </div>`,
            // Things that will change from "from" to "to" over load time
            css: [
                {
                    cssSelector: ".loadColor",
                    attr: "height",
                    // All in percents?
                    from: 0,
                    to: 100,
                    valTypeChar: "%", // or "px" or "". Whatever the value type is.
                },
                        /*
                         {
                         cssSelector: ".loadColor",
                         attr:"opacity",
                         from:0,
                         to:1,
                         valTypeChar:"",
                         },
                         */
            ],
            textElem: ".loader_text",
            confirmElem: ".loader_confirm"
        },
    }


    this.clear = function () {
        this.set(0);
        this.globalAt = false;
        this.globalLeft = false;
        this.loadTimers = [];
    }
    this.set = function (percent) {
        percent = Math.min(Math.max(percent, 0), 100);
        for (let e = 0; e < this.loadSpecs.css.length; e++) {
            let elemSpecs = this.loadSpecs.css[e];
            let jqElem = this.elem.find(elemSpecs.cssSelector);
            let decimal = percent / 100;
            let percentAdjusted = (decimal * (elemSpecs.to - elemSpecs.from)) + elemSpecs.from;
            jqElem.css(elemSpecs.attr, percentAdjusted + elemSpecs.valTypeChar);
        }
    }
    this.say = function (what) {
        if (this.loadSpecs.textElem) {
            let speaker = this.elem.find(this.loadSpecs.textElem);
            if (speaker) {
                speaker.html(what);
            } else {
                console.error("Loader element described, but not found");
            }
        } else {
            console.info("Loader says: " + what);
        }
    };
    this.confirm = function (message, cb) {
        let confirm = this.elem.find(this.loadSpecs.confirmElem);
        if (confirm) {
            confirm.html(message);
            confirm.onclick = cb;
            confirm.removeClass("hide");
        }   else {
            window.confirm(message, cb);
        }

    }
    this.error = function () {
        this.set(100);
        $(".loadColor").addClass("errored");
    };
    this.show = function () {
        this.elem.css({"display": "block"});
    }
    this.hide = function () {
        this.elem.css({"display": "none"});
    }
    this.loadTimers = [];

    this.blindCalculatePrep = function (totalAssets) {
        this.globalLeft = totalAssets;
        this.globalAt = 0;
    }
    this.blindCalculate = function () {
        if (this.globalAt === false || this.globalLeft === false) {
            console.error("ERROR: Call blindCalculatePrep FIRST, with the number of total assets. Then blindCalculate()");
        } else {
            this.globalAt++;
            this.calculate(this.globalAt, this.globalLeft);
        }
    }
    this.end = function (cb) {
        this.set(100);
        this.hide();
        this.clear();
        if (cb)
            cb();
    }
    this.calculate = function (at, left) {
        // Loading to 1 above current
        at++;
        let dryPercent = 100 * (at / left);
        this.loadTimers.push(now());
        let avgTime = 0;
        // No need to recalculate every time, just every 4th time?
        if (this.loadTimers.length % 2 == 0) {
            for (let t = 1; t < this.loadTimers.length; t++) {
                avgTime += this.loadTimers[t] - this.loadTimers[t - 1];
            }
            avgTime /= this.loadTimers.length - 1;
            avgTime /= 1000; // setting in seconds
            avgTime *= 1.2; // Allow a 20% buffer for "Hey it's faster than it said WOO"
            for (let e = 0; e < this.loadSpecs.css.length; e++) {
                let elemSpecs = this.loadSpecs.css[e];
                this.elem.find(elemSpecs.cssSelector).css("transition-duration", avgTime + "s");
            }
        }
        this.set(dryPercent);
    }

    this.init = function () {
        if (this.messyLoader[type]) {
            this.loadSpecs = this.messyLoader[type];
            container.append("<div class='loader' style='display:none'></div>");
            this.elem = $(container.find(".loader")[0]);
            this.elem.append(this.loadSpecs.html);
            this.set(0);
            this.show();
        } else {
            error("fatal", "progress", "Unknown loader type " + type + ", please make it or specify a known one. List of known");
            console.log(Object.keys(this.messyLoaderHTML));
        }
    }
    this.init();
}

function testLoader() {
    let at = 0;
    let timertimer = window.setInterval(function () {
        at++;
        pubbly.progressGraph.calculate(at, 10);
        if (at >= 10) {
            window.clearInterval(timertimer);
            alert("DONE");
        }
    }, 1000);
}
