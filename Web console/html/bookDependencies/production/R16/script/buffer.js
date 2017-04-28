var coverWhiteLineRoundingStrength = 2; // "White line" problem explained
/*
 PREVIOUSLY,

 Front and back covers were their proper width. Ray didn't like having to shift objects, so he made front and back covers double wide. This means I get a white margin on the left and right of the image.

 In order to fix this on my end, I had to shift the CAN element left by pUnit/2,	then shift the containing DIV right by pUnit/2.	This covered the white margin.

 Ran into a problem, however, with scaling. If the background image was 200px, but displayed in a 100px resolution, the meta data was getting rounded inside CHROME and getting a white line on the left hand side. As a messy fix to this, I've trimmed 1 pixel off either side of the image and the white line is hidden again.

 If this problem reappears, increase the strength of the trim.
 */

if (typeof spriteFail == "undefined") {
    spriteFail = false;
}

var firstLoad = true, secondLoad = true, dragDropRect = true;
var testWait = 0;

function removeLoader() {
    if (spriteKey) {
        book.sprite.removeEventListener('load', removeLoader, false);
        book.sprite.removeEventListener('canplaythrough', removeLoader, false);
    }
    addUserControl();
}

function loadAssets() {
    if (book.sprite) {
        var pageKey = curPage - 1;
        if (pageKey == 0) {
            pageKey = 1
        }
        book.sprite.currentTime = spriteKey['page' + pageKey].start;
        nextBuffer(bufNum);
    } else {
        book.sprite = document.getElementById("audioController");
        if (window.viewing !== "local") { // local viewings, no sprite. Honestly, I'm just tired of looking at the error when testing.
            book.sprite.src = assetsLoc + "audio/sprite.ogg";
        }
        book.sprite.waitingForSilence = false;
        book.sprite.timeout = false;


        if (isPad && !isCordova) {
            document.getElementById('shade').addEventListener("mouseup", startSprite, false);
        } else {
            startSprite();
        }
    }


    function startSprite() {
        var shade = document.getElementById('shade');
        shade.removeEventListener("mouseup", startSprite);

        $("#tapPromptCentered").css("display", "none");
        book.loader = new loader(shade);
        // triggered once sound can play through.
        function startBuffer() {
            if (bufObjArr.length < 1) {
                bufObjArr.push(new buffer());
                if (spriteFail) {
                    window.clearTimeout(spriteFail);
                    spriteFail = false;
                }
            }
        }

        if (spriteKey) {
            // emergency timeout.
            spriteFail = window.setTimeout(function () {
                console.warn("sprite did not load in time, skipping...");
                startBuffer();
            }, 2000);
            // sprite errors
            book.sprite.onerror = function (e) {
                book.bugs.log("Audio sprite error, using individual files instead (no preloading on tablets). Check console for details.");
                console.error("Audio sprite error, using individual files instead.");
                console.error(e);
                startBuffer();
            };

            book.sprite.load();

            book.sprite.addEventListener("canplaythrough", startBuffer, false);
            book.sprite.addEventListener("load", startBuffer, false);
        } else {
            startBuffer();
        }
    }
}

function buffer() {
    var THIS = this;
    this.running = true;
    this.clear = false;
    this.path = false;
    var bufPageOrder = [], bufOrderFinal = [], unloadArr = [], bufNum = 0, absSwitch = 1, slotAddNum = 1, slot = 0, i = 0;

    function isLoaded(check) {
        if (bufArr[check + "load"] == true) {
            return true;
        } else {
            return false;
        }
    }

    for (var page = 0; page < book.length; page++) {
        unloadArr[page] = true;
    }
    for (slot = curPage; i < 3; i++) {
        if (slot > 0 && slot <= book.length) {
            bufPageOrder.push(slot);
            unloadArr[slot - 1] = false;
        }
        absSwitch *= -1;
        slot += (absSwitch * slotAddNum);
        slotAddNum++;
    }
    for (key in bufPageOrder) {
        for (elem in bufArr[bufPageOrder[key] - 1]) {
            var elem = bufArr[bufPageOrder[key] - 1][elem];
            bufOrderFinal.push("image," + elem + "," + bufPageOrder[key]);
        }
        bufOrderFinal.push("page," + bufPageOrder[key] + "," + bufPageOrder[key]);
        bufArr[(bufOrderFinal[key] - 1) + 'at'] = 0;
    }
    // change to one hit only
    for (key in bufOrderFinal) {
        bufOrderFinal[key] = bufOrderFinal[key].split(",");
    }
    for (page in unloadArr) {
        var cur = unloadArr[page];
        if (cur && isLoaded(page)) {
            var pageObjKey = book[page].objKey;
            for (obj in pageObjKey) {
                if (book[page].objs[pageObjKey[obj]].type != 'video') {
                    delete book[page].objs[pageObjKey[obj]].elem;
                }
            }
            for (aud in book[page].auds) {
                var par = book[page].auds[aud].elem.parentElement;
                if (par) {
                    par.removeChild(book[page].auds[aud].elem);
                    book[page].auds[aud].elem = false;
                }
            }
            book[page].CAN.width = book[page].CAN.width;
            book[page].BUF.width = book[page].BUF.width;
            book[page].DIV.width = book[page].DIV.width;
            book[page].loaded = false;
            bufArr[page + 'at'] = 0;
        }
    }
    nextBuffer(0);
    // buffer the next object in the list.
    function nextBuffer(num) {
        bufNum++;
        if (THIS.clear) {
            //console.info("buffer has stopped at item " + bufNum);
            //console.info(bufOrderFinal);
            bufObjArr.splice(THIS.path, 1);
        } else {
            window.setTimeout(function () {
                var split = bufOrderFinal[num];
                if (split) {
                    //book[split[2]-1].progressgraph.update(5,10);
                    bufferElement(split[0], split[1], split[2] - 1);
                } else {
                    // NOTE fully buffered
                    THIS.running = false;
                }
            }, testWait);
        }
    }

    function bufferElement(type, name, location) {
        if (firstLoad) {
            book.loader.update(bufNum - 1, bufArr[0].length);
        }

        var splitName = name.split(".");
        if (splitName.length > 1) {
            var dotLen = splitName.length;
            type = splitName[dotLen - 1];
            name = splitName.splice(0, dotLen - 1).join(".");
        }
        if (isNaN(location)) {
            location = name;
        }
        pageLoc = book[location];
        if (type == "image") {
            if (book[location].objs[name].elem) {
                // book[location].redraw();
                nextBuffer(bufNum);
            } else {
                var objLoc = book[location].objs[name];
                // Check for objLoc.length. If zero, treat the gif as an image
                if ((objLoc.extension == "gif" || objLoc.isSequence) && objLoc.frames) {
                    var framesLoaded = 0;
                    for (var f = 0; f <= objLoc.length - 1; f++) {
                        var frameSrc;
                        if (objLoc.isSequence) {
                            frameSrc = assetsLoc + "images/" + objLoc.sequenceFolderName + "/" + objLoc.frameNames[f];
                        } else {
                            frameSrc = assetsLoc + "images/gifFrames/" + objLoc.fileName + "-frame-" + f + ".png";
                        }
                        book[location].objs[name].frames.push(new Image());
                        var frame = book[location].objs[name].frames[book[location].objs[name].frames.length - 1];
                        frame.onerror = function (e) {
                            book.bugs.log("Problem loading gif/sequence frames with object <b>" + objLoc.name + "</b>.");
                            framesLoaded++;
                            if (framesLoaded == objLoc.length) {
                                nextBuffer(bufNum);
                            }
                        };
                        frame.onload = function () {
                            framesLoaded++;
                            if (framesLoaded == objLoc.length) {
                                objLoc.elem = objLoc.frames[0];
                                nextBuffer(bufNum);
                            }
                        };
                        frame.src = frameSrc;
                    }
                } else {
                    book[location].objs[name].elem = new Image();
                    var canvas = pageLoc.BUF;
                    var context = canvas.getContext('2d');
                    var objLoc = pageLoc.objs[name];
                    var img = objLoc.elem;
                    img.onerror = function (e) {
                        book.bugs.log("Image <b>" + objLoc.src + "</b> did not load");
                        /*
                         console.error(objLoc);
                         console.error(e);
                         */
                        nextBuffer(bufNum);
                    };
                    img.src = assetsLoc + objLoc.src + noCacheExt();
                    img.onload = function () {
                        if (objLoc.initVis == "show") {
                            context.drawImage(this, objLoc.left, objLoc.top, objLoc.width, objLoc.height);
                        }
                        nextBuffer(bufNum);
                    }
                }
            }
        } else if (type == "audio") {
            if (!document.getElementById(name)) {
                book[location].auds[name].elem = new Audio();
                var aud = book[location].auds[name].elem;
                var src = false;
                src = assetsLoc + "audio/" + name + ".ogg";
                aud.id = name;
                aud.errorNum = 0;
                document.getElementById("audioDiv").appendChild(aud);
                if (isPad || isFirefox) {
                    nextBuffer(bufNum);
                } else {
                    aud.addEventListener('canplaythrough', function () {
                        bufArr[location + "load"] += 1 / bufArr[location].length;
                        nextBuffer(bufNum);
                    }, false);
                }
                aud.onerror = function () {
                    if (aud.errorNum == 0) {
                        aud.errorNum++;
                        aud.src = 'audio/' + name + '.wav';
                    } else {
                        book.bugs.log("Audio <b>" + aud.src + "</b> did not load");
                        nextBuffer(bufNum);
                    }
                }
                aud.src = src;
            } else {
                book[location].auds[name].elem = document.getElementById(name);
                nextBuffer(bufNum);
            }
        } else if (type == "video") {
            var curObj = book[location].objs[name];
            if (curObj.elem) {
                nextBuffer(bufNum);
            } else {
                if (!curObj.created) {
                    curObj.created = true;
                    if (isFirefox && isMac) {
                        curObj.elem = document.createElement('embed');
                        curObj.elem.type = 'video/mp4';
                    } else {
                        curObj.elem = document.createElement('video');
                    }

                    curObj.elem.height = curObj.height;
                    curObj.elem.width = curObj.width;
                    curObj.elem.src = curObj.src;
                    curObj.elem.id = curObj.name;
                    book[location].DIV.appendChild(curObj.elem);
                    $(curObj.elem).css({
                        'top': curObj.top,
                        'left': curObj.left,
                        'height': curObj.height,
                        'width': curObj.width,
                        'position': 'absolute',
                        'visibility': curObj.vis
                    });
                    curObj.elem.src = curObj.src;
                    nextBuffer(bufNum);
                    curObj.elem.onError = function () {
                        book.bugs.log("Video <b>" + curObj.name + "</b> did not load, check console for details");
                        console.error("Video " + curObj.name + " did not load.");
                        console.error(e);
                        nextBuffer(bufNum);
                    }
                }
            }
        } else if (type == "workspace") {
            nextBuffer(bufNum);
        } else if (type == "highlighter") {
            nextBuffer(bufNum);
        } else if (type == "page") {
            if (firstLoad) {
                if (testWait && testWait > 0) {
                    console.warn("testWait enabled, load halted");
                } else {
                    firstLoad = false;
                    // draw video elements if any
                    arrangePages();
                    createGoto();
                    addUserControl();
                }
            } else if (secondLoad) {
                secondLoad = false;
                try {
                    book[0].CAN.getContext('2d').getImageData(0, 0, 1, 1);
                } catch (e) {
                    if (e.code = 18) {
                        console.warn('drag locations are set to bounding rect for local export');
                        dragDropRect = true;
                    } else {
                        window.alert('Pubbly requires HTML5 canvases, please update your browser');
                        console.log(e);
                    }
                }
            }
            buf = pageLoc.BUF;
            canCtx = pageLoc.CAN.getContext('2d');
            canCtx.drawImage(buf, 0, 0);
            bufArr[location + "load"] = true;
            book[location].loaded = true;
            if (book[location].progressgraph) {
                book[location].progressgraph.kill();
                delete book[location].progressgraph;
            }
            pageLoc.redraw();
            nextBuffer(bufNum);
        } else if (type == "drawing") {
            nextBuffer(bufNum); // No load for drawing required;
        } else if (type == "text") {
            nextBuffer(bufNum);
        } else if (type == "field") {
            // Ray keeps putting Snap fields in the XML!, ignore.
            nextBuffer(bufNum);
        } else {
            book.bugs.log('Unknown buffer type <b>' + type + '</b>, asset skipped.');
            nextBuffer(bufNum);
        }
    }
}
// to recalculate buffer priority, clear all buffers in bufObjArr (bufObjArr[0].clear = true).
// btx.putImageData(img, 0, 0);
//
// This will NOT stop them from buffering their last image/page/audio!
// It will allow them to finished their current task.
//
// ADD A NEW BUFFER with bufObjArr.push(new buffer());
// the new buffer will recalculate priority based on the new information.
//
// Recalculate buffer priorities on every page turn and audiolink click.
function arrangePages() {
    for (var pNum = 0; pNum < book.length; pNum++) {
        var PAGE = book[pNum].DIV;
        var DUP = book[pNum].DUP;
        var rNum = Math.abs(pNum - (curPage - 1));
        var pLeft = 0;
        var pIndex = 0;
        var pWidth = 0;
        var pVis = 'hidden';
        var pDis = 'none';
        if (pDisplay == 'Single') {
            if (rNum < 0) {
                pLeft = -1 * pUnit;
                pIndex = 1;
                pWidth = pUnit;
                pVis = 'visible';
                pDis = 'block';
            } else if (rNum == 0) {
                pLeft = 0;
                pIndex = 1;
                pWidth = pUnit;
                pVis = 'visible';
                pDis = 'block';
            } else if (rNum == 1) {
                pLeft = pUnit;
                pIndex = 1;
                pWidth = pUnit;
                pVis = 'visible';
                pDis = 'block';
            } else {
                pLeft = pUnit;
                pIndex = 1;
                pWidth = pUnit;
                pVis = 'hidden';
                pDis = 'none';
            }
        } else if (pDisplay == 'SingleSpread') {
            if (curPage == 1) {
                switch (rNum) {
                    // on the swing, open as regular, swing right pUnit/2
                    case 0:
                        pLeft = pUnit / 2;
                        pIndex = 4;
                        pWidth = pUnit;
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                    case 1:
                        pLeft = pUnit / 2;
                        pIndex = 3;
                        pWidth = pUnit;
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                    case 2:
                        pLeft = pUnit / 2;
                        pIndex = 3;
                        pWidth = pUnit;
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                    default:
                        pLeft = pUnit * 2;
                        pIndex = 2;
                        pWidth = 0;
                        break;
                }
            } else if (curPage == bookLength + 1) {
                switch (rNum) {
                    case - 3:
                        pLeft = pUnit / 2;
                        pIndex = 3;
                        pWidth = 0;
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                    case - 2:
                        pLeft = pUnit / 2;
                        pIndex = 4;
                        pWidth = 0;
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                    case - 1:
                        pLeft = pUnit / 2;
                        pIndex = 5;
                        pWidth = pUnit;
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                    default:
                        pLeft = 0;
                        pIndex = 2;
                        pWidth = 0;
                        break;
                }
            } else {
                switch (rNum) {
                    case - 3:
                        pLeft = 0;
                        pIndex = 1;
                        pWidth = pUnit;
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                    case - 2:
                        pLeft = -pUnit;
                        pIndex = 1;
                        pWidth = pUnit;
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                    case - 1:
                        pLeft = 0;
                        pIndex = 2;
                        pWidth = pUnit;
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                    case 0:
                        pLeft = pUnit;
                        pIndex = 4;
                        pWidth = pUnit;
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                    case 1:
                        pLeft = pUnit * 2;
                        pIndex = 1;
                        pWidth = pUnit;
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                    case 2:
                        pLeft = pUnit;
                        pIndex = 1;
                        pWidth = pUnit;
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                    default:
                        pLeft = 0;
                        pIndex = 1;
                        pWidth = 0;
                        break;
                }
            }
        } else if (pDisplay == 'BlockSpread') {
            if (curPage == 1) {
                // first page
                switch (rNum) {
                    case 0:
                        pLeft = pUnit / 2;
                        pIndex = 3;
                        pWidth = pUnit - (coverWhiteLineRoundingStrength * 2); // "White line" problem fix
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                    case 1:
                        pLeft = pUnit * 2;
                        pWidth = pUnit * 2;
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                    default:
                        pLeft = pUnit;
                        pWidth = pUnit * 2;
                        pVis = 'visible';
                        pDis = 'none';
                        break;
                }
            } else if (curPage == bookLength && !book.lastPageDouble) {
                // Last page to cover
                switch (rNum) {
                    case - 1:
                        pLeft = 0;
                        pIndex = 1;
                        pWidth = pUnit * 2;
                        pVis = 'visible';
                        pDis = 'none';
                        break;
                    case 0:
                        pLeft = pUnit / 2;
                        pIndex = 2;
                        pWidth = pUnit - (coverWhiteLineRoundingStrength * 2); // "White line" problem fix
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                }
            } else {
                // Normal turn
                switch (rNum) {
                    case - 1:
                        pLeft = -pUnit * 2;
                        pIndex = 2;
                        if (pNum == 0) {
                            pWidth = pUnit;
                        } else {
                            pWidth = pUnit * 2;
                        }
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                    case 0:
                        pLeft = 0;
                        pIndex = 3;
                        pWidth = pUnit * 2;
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                    case 1:
                        pLeft = pUnit * 2;
                        pIndex = 2;
                        if (pNum == bookLength - 1) {
                            pWidth = pUnit;
                        } else {
                            pWidth = pUnit * 2;
                        }
                        pVis = 'visible';
                        pDis = 'block';
                        break;
                    default:
                        pLeft = 0;
                        pWidth = pUnit * 2;
                        pIndex = 1;
                        pVis = 'hidden';
                        pDis = 'none';
                        break;
                }
            }
        }
        $(PAGE).css({"left": pLeft, "z-index": pIndex, "width": pWidth, 'display': pDis});
        if (DUP) {
            $(DUP).css({'display': 'none'});
        }
    }
    // double wide first page problem fix here
    if (book.alwaysDoubleWide && pDisplay !== "Single") {
        var halfByTwo = (-pUnit / 2) - coverWhiteLineRoundingStrength; // "White line" problem fix
        $(book[0].CAN).css("left", halfByTwo);
        if (!book.lastPageDouble) {
            $(book[book.length - 1].CAN).css("left", halfByTwo);
        }
    }
    visiblePages = [];
    visiblePages.push(book[curPage - 1]);
    if (pDisplay == 'SingleSpread' && curPage > 1 && !(isEven(bookLength) && curPage == book.length)) {
        visiblePages.push(book[curPage - 2]);
    }
    for (var p = 0; p < visiblePages.length; p++) {
        curP = visiblePages[p];
        if (curP && !curP.loaded && !curP.progressgraph) {
            curP.progressgraph = new spinner(curP.loadCont);
        }
    }
    /*
     var shade = document.getElementById('shade');
     shade.removeEventListener("mouseup", startSprite);
     book.loader = new loader(shade);
     */
    if (!book[curPage - 1].pageNavigationEnabled) {
        hideNav();
    } else {
        showNav();
    }
}


function createGoto() {
    var gotoAct = document.getElementById('gotoAct');
    var gotoCover = document.getElementById('gotoCover');
    var inner = [];
    inner.push('<option selected value=1>' + (pageNumberingStr[0] || 1) + '</option>');
    gotoCover.innerHTML = (pageNumberingStr[0] || 1);
    if (pDisplay == 'Single') {
        for (var i = 2; i <= book.length; i++) {
            var leftPage = pageNumberingStr[i - 1] || i;
            inner.push('<option value=' + i + '>' + leftPage + '</option>');
        }
    } else if (pDisplay == 'SingleSpread') {
        var endOfPageLoop = bookLength;
        var lastItem = false;
        if (isEven(bookLength)) {
            endOfPageLoop--;
            lastItem = bookLength;
        }
        for (var i = 2; i < bookLength; i += 2) {
            var leftPage = pageNumberingStr[i - 1] || i;
            var rightPage = pageNumberingStr[i] || i + 1;
            inner.push('<option value=' + (i + 1) + '>' + leftPage + ' - ' + rightPage + '</option>');
        }
        if (lastItem) {
            var rightPage = pageNumberingStr[lastItem - 1] || lastItem;
            inner.push('<option value=' + (lastItem + 1) + '>' + rightPage + '</option>');
        }
    } else if (pDisplay == 'BlockSpread') {
        for (var i = 2; i < book.length; i++) {
            var rightPageVis = (i * 2) - 1;
            var leftPageVis = rightPageVis - 1;
            var doubleStr = leftPageVis + ' - ' + rightPageVis;
            inner.push('<option value=' + i + '>' + (pageNumberingStr[i - 1] || doubleStr) + '</option>');
        }
        inner.push('<option value=' + bookLength + '>' + (pageNumberingStr[bookLength - 1] || (bookLength * 2) - 2) + '</option>');
    }


    // Loop through the pages, delete any options if page nav is disabled
    for (var p = book.length - 1; p >= 0; p--) {
        if (!book[p].pageNavigationEnabled) {
            inner.splice(p, 1);
        }
    }
    gotoAct.innerHTML = inner.join("");
}

var coverWhiteLineRoundingStrength = 2; // "White line" problem explained
/*
 PREVIOUSLY, ON "40 HOURS IN FRONT OF LEDs",

 Front and back covers were their proper width. Ray didn't like having to shift objects, so he made front and back covers double wide. This means I get a white margin on the left and right of the image.

 In order to fix this on my end, I had to shift the CAN element left by pUnit/2,	then shift the containing DIV right by pUnit/2.	This covered the white margin.

 Ran into a problem, however, with scaling. If the background image was 200px, but displayed in a 100px resolution, the meta data was getting rounded inside CHROME and getting a white line on the left hand side. As a messy fix to this, I've trimmed 1 pixel off either side of the image and the white line is hidden again.

 If this problem reappears, increase the strength of the trim.
 */
