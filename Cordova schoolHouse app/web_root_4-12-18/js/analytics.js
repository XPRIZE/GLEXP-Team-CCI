function generateAnalytics(id) {
    readFile("users/" + id + "/analytics.json", function (ret) {
        var postObj = {};
        var analyticsMain = JSON.parse(ret);
        postObj.userID = analyticsMain.userID;
        postObj.records = {};

        function nextRecord(entry) {
            var record = analyticsMain.records[entry];
            postObj.records[entry] = record;
            if (record.type == "bo") {
                var loc = record.recordLoc;
                readFile(loc, function (interactionsStr) {

                    var locDecoded = atob(loc.split("/")[1].split(".")[0]);
                    var locInfo = locDecoded.split("-");
                    var timestamp = locInfo.pop();
                    timestamp = timestamp.split(".")[0];
                    locInfo.pop(); // analytics
                    var book = decodeURI(locInfo.pop());
                    var subject = decodeURI(locInfo.pop());

                    postObj.records[entry].info = {
                        "timestamp": timestamp,
                        "book": book,
                        "subject": subject
                    };
                    if (interactionsStr && interactionsStr.length) {
                        postObj.records[entry].interactions = JSON.parse(interactionsStr);
                    }	else	{
                        postObj.records[entry].interactions = "";
                    }
                    recordArr.shift();
                    if (recordArr.length) {
                        nextRecord(recordArr[0]);
                    } else {
                        postAnalytics(postObj);
                    }

                });
            } else {
                recordArr.shift();
                if (recordArr.length) {
                    nextRecord(recordArr[0]);
                } else {
                    postAnalytics(postObj);

                }
            }
        }
        var recordArr = [];
        for (var entry in analyticsMain.records) {
            recordArr.push(entry);
        }
        nextRecord(recordArr[0]);
    });
}
function postAnalytics(what) {
    var postName = "TeamCCI-Analytics-" + device.serial + "-" + what.userID + ".json";
    var postData = what;
    /*
     var postNotes = {
     keys: {
     whatsthis: "Type keys.",
     uc: "user created",
     li: "log in",
     bo: "book open",
     xl: "xml loaded",
     fl: "first page loaded",
     lt: "link triggered",
     st: "sequence triggered",
     ss: "sequence started",
     sf: "sequence finished",
     ut: "user touch",
     pt: "page turn",
     bc: "book close"
     },
     timestamps: "Trimmed to save space. '15' + stamp + '000' will get you the true stamp, and is accurate by the second up to 2020",
     }
     */
    var postObj = {
        filename: postName,
        // notes: postNotes,
        data: postData
    };
    console.log(postObj);

    var jsonLoc = "users/" + postObj.data.userID + "/analytics-post.json";
    writeFile(jsonLoc, JSON.stringify(postObj), function () {
        var ip = "192.168.0.1";
        var user = "anonymous";
        var pass = "";
        window.cordova.plugin.ftp.connect(ip, user, pass, function (ok) {
            console.info("ftp: connect ok=" + ok);
            window.cordova.plugin.ftp.upload(jsonLoc, postName, function (ret) {
                console.log(ret);
            }, function (err) {
                console.log(err);
            });
        }, function (error) {
            console.error("ftp: connect error=" + error);
        });
    });
}



function retStamp() {
    return parseInt(Date.now() / 1000).toString().slice(2);
}

function onBatteryStatus(status) {
    if (status.isPlugged) {
        if (typeof $ !== "undefined") {
            readFile("users.xml", function (users) {
                var ids = $.parseXML(users).getElementsByTagName("id");
                for (var i = 0; i < ids.length; i++) {
                    generateAnalytics(ids[i].innerHTML);
                }
            });
        }
    }
}
