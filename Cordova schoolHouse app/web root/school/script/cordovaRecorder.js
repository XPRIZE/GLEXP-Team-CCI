// added to load.js because too lazy to redo html index files.

window.recorderReady = false;
function initRecorder(cb) {
    window.recorder = new Recorder();
    cb(recorder);
}
// Record audio
// 
function startRecording(name) {
    window.recorder.start(name);
    book.isRecording = true;
}
function stopRecording() {
    book.isRecording = false;
    var src = window.recorder.stop();
    book[curPage - 1].recordings[curSequence.recordingName] = src + "?" + Math.random(); // yup. cache.
    console.log("Recording saved to" + src);

    if (curSequence.maxRecordTime) {
        window.clearTimeout(curSequence.maxRecordTime);
    }
    if (curSequence) {
        curSequence.next();
    }
}

function Recorder() {
    var recorderScope = this;
    this.media = false;
    this.src = false;

    this.start = function (name) {
        //recorderScope.src = name + ".amr"; // rand for cache?
        var fsName = recAbsName(name, curPage);
        book[curPage - 1].recordings[name] = false;
        recorderScope.src = fsName;
        recorderScope.media = new Media(recorderScope.src);
        console.log("Recording to " + fsName);
        recorderScope.media.startRecord();
    };
    this.stop = function () {
        recorderScope.media.stopRecord();
        return recorderScope.src;
    };
    return this;
}

function readshit(fn) {
    dirEntry.getFile(fn, {create: false}, function (fileEntry) {
        fileEntry.file(function (file) {
            var reader = new FileReader();

            reader.onloadend = function () {
                console.log("Successful file read: " + this.result);
                displayFileData(fileEntry.fullPath + ": " + this.result);
            };

            reader.readAsText(file);

        }, onErrorReadFile);
        function onErrorReadFile(err, mesg) {
            console.log(err);
            console.log(mesg);
        }
    }, onErrorCreateFile);

}
/*
 window.setTimeout(function () {
 var src = "myrecording.amr";
 var mediaRec = new Media(src);
 
 // Record audio
 mediaRec.startRecord();
 console.log("started");
 
 // Stop recording after 10 sec
 var recTime = 0;
 var recInterval = setInterval(function () {
 recTime = recTime + 1;
 console.log(recTime);
 if (recTime >= 10) {
 clearInterval(recInterval);
 mediaRec.stopRecord();
 console.log(mediaRec);
 }
 }, 1000);
 }, 1000)
 */
function testSrc(src) {
    var myMedia = new Media(src);
    myMedia.play();
}
