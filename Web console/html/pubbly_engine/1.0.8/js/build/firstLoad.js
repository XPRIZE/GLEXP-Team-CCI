// NOT CONNECTED TO BUFFER, maybe put in another js file?
//
// First load is the function you call when you XML has been changed.
// It checks every asset and makes sure the file extensions are all good.
//  -- UPDATS the XML given
function firstLoad(xml, progressGraph, bookLoc, cb) {
    // First ever load of project. Manually checks EVERY asset, and writes a "broken.json" file for any missing.
    // Subsequent loads simply check the json for broken links, and can afterwards EXPECT all files to be good, thus saving load times
    let tot = 0;
    let found = 0;
    let checked = 0;
    let missing = [];
    let assets = [];
    for (let p = 0; p < xml.pages.length; p++) {
        progressGraph.say("Checking assets");
        let curPage = xml.pages[p];
        for (let o = 0; o < curPage.objs.length; o++) {
            let curObj = curPage.objs[o];
            let files = [];
            
            let folderName = "images";
            if (curObj.frames) {
                for (let f = 0; f < curObj.frames.length; f++) {
                    curObj.frames[f].src = bookLoc + "/" + 
                            folderName + "/" + 
                            curObj.frames[f].fileName;
                    files.push(folderName + "/" + curObj.frames[f].fileName);
                }
            } else if (curObj.fileName) { // excludes fields and such
                curObj.src = bookLoc + "/" + folderName + "/" + curObj.fileName;
                files.push(folderName + "/" + curObj.fileName);
            }
            for (let f = 0; f < files.length; f++) {
                tot++;
                $.ajax({
                    url: bookLoc + "/" + files[f],
                    type: 'text',
                    method: 'get',
                    error: function () {
                        let name = this.url.split("/").pop();
                        assetMissing(name);
                    },
                    success: assetFound,
                });
            }
        }
        for (let a = 0; a < curPage.auds.length; a++) {
            let curAud = curPage.auds[a];
            let folderName = "audio";
            let src = bookLoc + "/" + folderName + "/" + curAud.filename;
            curAud.ext = "mp3";
            curAud.src = src + ".mp3";
            tot++;
            $.ajax({
                url: src + ".mp3",
                type: 'text',
                method: 'get',
                error: function () {
                    curAud.ext = "wav";
                    curAud.src = src + ".wav";
                    $.ajax({
                        url: src + ".wav",
                        type: 'text',
                        method: 'get',
                        error: function () {
                            curAud.ext = "ogg";
                            curAud.src = src + ".ogg";
                            $.ajax({
                                url: src + ".ogg",
                                type: 'text',
                                method: 'get',
                                error: function () {
                                    curAud.ext = false;
                                    curAud.src = false;
                                    curAud.errored = true;
                                    assetMissing(src.split("/").pop() + ".mp3");
                                },
                                success: assetFound,
                            });
                        },
                        success: assetFound,
                    });
                },
                success: assetFound,
            });
        }
    }
    function assetFound() {
        progressGraph.say("Found " + found + "/" + tot);
        progressGraph.calculate(found, tot);
        found++;
        checked++;
        if (found == tot) {
            allAssetsFound();
        } else if (checked == tot) {
            allAssetsCheckedButSomeMissing();
        }
    }
    function assetMissing(srcName) {
        missing.push(srcName);
        checked++;
        if (checked == tot) {
            allAssetsCheckedButSomeMissing();
        }
    }
    function allAssetsCheckedButSomeMissing() {
        // shutup itsa good naem
        let message = "Some assets missing.<br>" +
                "<br><br>" +
                "<span style='float:left;text-align:left;'>" +
                missing.join('<br>') +
                "</span>";
        progressGraph.say(message);
        progressGraph.confirm("Run anyway", function() {
            console.log(xml);
        })
        progressGraph.error();
        // error("fatal", "Buffer first page", message);
    }
    function allAssetsFound() {
        progressGraph.say("All assets found, writing JSON");
        cb(xml);
    }
    if (tot == 0) {
        allAssetsFound();
    }
}
