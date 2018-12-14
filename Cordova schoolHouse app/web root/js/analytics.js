function retStamp() {
    return Date.now().toString();
}

function Analytics(credentials) {
    let THIS = this;

    // Prevents double posts
    this.uploading = false;
    this.testingConnection = false;


    this.localBase = "/data/data/com.cci.schoolHouse/files/files/";
    this.remoteBase = "remote/";
    this.ip = "192.168.0.1";
    this.user = "anonymous";
    this.pass = "";

    if (credentials) {
        this.localBase = credentials.localBase || this.localBase;
        this.remoteBase = credentials.remoteBase || this.remoteBase;
        this.ip = credentials.ip || this.ip;
        this.user = credentials.user || this.user;
        this.pass = credentials.pass || this.pass;
    }

    this.logStamp = Date.now().toString();
    this.logName = "analytics_post_attempt_" + this.logStamp;
    logToSD(THIS.logName, "Analytics object created");

	// Can ftp test the actual Xprize build, through adb checkpoint.
    let inhouseFtpTesting = false;
	if (inhouseFtpTesting) {
		this.ip = "jasonhorsley.brickftp.com";
		this.user = "Jason@JasonHorsley.tech";
		this.pass = "pubblytesting123";
    }

    this.testConnection = function (cb) {
        THIS.testingConnection = true;
        logToSD(THIS.logName, "Testing for connection -- " + THIS.ip + " U:" + THIS.user + " P:" + THIS.pass);

        window.cordova.plugin.ftp.connect(THIS.ip, THIS.user, THIS.pass, function (ok) {
            logToSD(THIS.logName, "Connection OK");
            THIS.testingConnection = false;
            window.cordova.plugin.ftp.disconnect(function (what) {
                cb(true);
            }, function (error) {
                logToSD(THIS.logName, "Disconnect error: " + error);
                console.log("Disconnect error: " + error);
                // cb(true) ADDED, so if we get Disconnect error, that's what was causing probs
                cb(true);
            });
        }, function (error) {
            logToSD(THIS.logName, "Connect error: " + error);
            console.error("Connect error: " + error);
            cb(false);
        });
    }

    this.attemptPost = function () {
        // Prevents multiple instances from making a mess
        if (!THIS.uploading && !THIS.testingConnection) {
            THIS.testConnection(function (status) {
                if (status === true) {
                    THIS.uploading = true;
                    // Never bother resetting uploading, cause the only way you make new records is by going to new pages.
                    logToSD(THIS.logName, "Connection test passed, fetching user accounts");
                    THIS.fetchRecords();
                } else {
                    // No connection yet.
                    logToSD(THIS.logName, "Connection test failed, device out of range");
                }
            });
        }
    }

    this.fetchRecords = function () {
        readFile("users.xml", function (users) {
            if (users)
                logToSD(THIS.logName, "User accounts found, fetching records");
            let ids = $.parseXML(users).getElementsByTagName("id");

            THIS.recordArr = [];
            let userCount = 0;
            let userTarg = ids.length;
            let userLoaded = function () {
                userCount++;
                if (userCount >= userTarg) {
                    if (THIS.recordArr[0]) {
                        logToSD(THIS.logName, THIS.recordArr.length + " new records for all users. Posting one at a time");
                        THIS.postSingle(THIS.recordArr[0], THIS.nextRecord);
                    } else {
                        console.log("Already uploaded latest data");
                        logToSD(THIS.logName, "No new records to post [EXIT]");
                    }

                }
            }
            for (let i = 0; i < ids.length; i++) {
                let id = ids[i].textContent;
                readFile("users/" + id + "/analytics.json", function (ret) {
                    logToSD(THIS.logName, "Analytic master file found for UID " + id);
                    let analyticsMain = JSON.parse(ret);
                    let serial = (device && device.serial) ?
                      device.serial.toString() :
                      // Avoid naming conflicts (probs are in millions at this point = good nuff)
                      "noserial_" + Math.random().toString().split(".")[1];
                    let recordCount = 0;
                    let entry;
                    for (entry in analyticsMain.records) {
                        if (analyticsMain.records[entry].recordLoc) {
                            recordCount++;
                        }
                    }
                    // Only update analytics if you have something new to post.
                    if (recordCount) {
                        THIS.recordArr.push({
                            uid: id,
                            rid: 'analytics',
                            remoteName: btoa(serial + "-" + id + "-analytics-" + Date.now().toString()) + ".json",
                            localName: 'users/' + id + "/analytics.json",
                        });
                    }

                    for (entry in analyticsMain.records) {
                        let record = {
                            uid: id,
                            rid: entry,
                        };
                        let loc = analyticsMain.records[entry].recordLoc;
                        if (loc) {
                            record.localName = loc;
                            let fileName = atob(loc.split("/")[1].split(".")[0]);
                            record.remoteName = btoa(serial + "-" + fileName) + ".json";
                            THIS.recordArr.push(record);
                        }
                    }
                    logToSD(THIS.logName, recordCount + " new records for user " + id);
                    userLoaded();
                }, userLoaded);
            }
        });
    }
    this.nextRecord = function (deleteRecord) {
        let rec = THIS.recordArr[0];
        THIS.recordArr.shift();
        let nextOrDone = function () {
            if (THIS.recordArr[0]) {
                THIS.postSingle(THIS.recordArr[0], THIS.nextRecord);
            } else {
                logToSD(THIS.logName, "All files posted {EXIT}");
            }
        }
        if (deleteRecord && rec.rid !== "analytics") {
            // TODO: always?
            deleteFile(rec.localName, function () {
                THIS.updateAnalytics(rec, nextOrDone);
            }, function () {
                // File doesn't exist, delete record from analytics
                THIS.updateAnalytics(rec, nextOrDone);
            });
        } else {
            nextOrDone();
        }
    }
    this.updateAnalytics = function (removeRec, cb) {
        readFile("users/" + removeRec.uid + "/analytics.json", function (ret) {
            // Force exit? Who cares
            let analyticsMain = JSON.parse(ret);
            delete analyticsMain.records[removeRec.rid];
            let newAnalytics = JSON.stringify(analyticsMain);
            overwriteFileSafe("users/" + removeRec.uid + "/analytics.json", newAnalytics, cb, cb);
        });
    }

    this.postSingle = function (record, cb) {
        let localFile = THIS.localBase + record.localName;
        let remoteFile = THIS.remoteBase + record.remoteName;
        logToSD(THIS.logName, "Reading " + record.localName + " for post");
        readFile(record.localName, function (ret) {
            if (ret !== false) {
                logToSD(THIS.logName, "File " + record.localName + " exists, Connecting to " + THIS.ip + " U:" + THIS.user + " P:" + THIS.pass + " for upload");
                window.cordova.plugin.ftp.connect(THIS.ip, THIS.user, THIS.pass, function (ok) {
                    logToSD(THIS.logName, "Uploading " + localFile + " to " + remoteFile);
                    console.log("Connection good. Uploading " + localFile + " to " + remoteFile);
                    window.cordova.plugin.ftp.upload(localFile, remoteFile, function (percent) {
                        if (percent == 1) {
                            logToSD(THIS.logName, "Upload finished, check server");
                            console.log("Upload finish, please check server");
                            window.cordova.plugin.ftp.disconnect(function (what) {
                                cb(true);
                            }, function (what) {
                                cb(true);
                            });
                        } else {
                            console.log("Upload percent: " + percent * 100 + "%");
                        }
                    }, function (error) {
                        logToSD(THIS.logName, "Upload error: " + error);
                        console.error("Upload error: " + error);
                        if (error)
                            window.cordova.plugin.ftp.disconnect(function (what) {
                                cb(false);
                            }, function (what) {
                                cb(false);
                            });
                    });
                }, function (error) {
                    logToSD(THIS.logName, "Connection error: " + error);
                    console.error("Connect error: " + error);
                });
            } else {
                logToSD(THIS.logName, "File " + record.localName + " DOES NOT EXIST ON DEVICE, skipping");
                // File doesn't exist, delete from analytics
                cb(true);
            }
        }, function () {
            // Bad read? Better call back just incase and attempt delete from analytics
            cb(true);
        })

    }

    this.checks = function () {
        // Try if charging
        window.addEventListener("batterystatus", function (status) {
            // Charge changed by 1%
            if (status.isPlugged) {
                THIS.attemptPost();
                logToSD(THIS.logName, "Testing connection (Triggered by battery charge event)");
            }
        }, false);

        // Try on first launch
        let splitLoc = window.location.href.split("?");
        if (splitLoc.length > 1 && splitLoc[1] == "firstLaunch") {
            THIS.attemptPost();
            logToSD(THIS.logName, "Testing connection (Triggered by first boot)");
        }

        // Try every 10 minutes
        // 1 min   = 1510000600000
        // 10 min  = 1510006000000
        // COULND"T FIGURE IT OUT< SO IT"S EVERY 16.6666 minutes
        let attemptInt = 999999;
        let startOffset = Date.now().toString().substr(7);
        window.setTimeout(function () {
            logToSD(THIS.logName, "Testing connection (Triggered by 15 min interval)");
            THIS.attemptPost();
            window.setInterval(function () {
                THIS.attemptPost();
            }, attemptInt);
        }, startOffset);

        // Try on every launch
        THIS.attemptPost();
        logToSD(THIS.logName, "Testing connection (Triggered by screen change)");
    }
    this.checks();
}
// Created by index js files for each page (prevent creation pre device ready);
// AnalyticHandler = new AnalyticHandler();



/*
 function ActLog() {
 let THIS = this;
 this.queue = [];
 this.virgin = true;
 this.addQueue = function (fileName, data) {
 this.queue.push({fn: fileName, dt: data});
 if (this.virgin) {
 this.virgin = false;
 this.log();
 }
 }
 this.log = function () {
 if (THIS.queue.length == 0) {
 THIS.virgin = true;
 } else {
 var item = THIS.queue.pop();
 var data = item.dt;
 var fileName = item.fn + ".txt";
 window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (directoryEntry) {
 directoryEntry.getFile(fileName, {create: true}, function (fileEntry) {
 fileEntry.createWriter(function (fileWriter) {
 fileWriter.onwriteend = function (result) {
 console.log('done.');
 THIS.log();
 };
 fileWriter.onerror = function (error) {
 console.log(error);
 THIS.log();
 };
 fileWriter.seek(fileWriter.length);
 fileWriter.write(data + '\n');
 }, function (error) {
 console.log(error);
 THIS.log();
 });
 }, function (error) {
 console.log(error);
 THIS.log();
 });
 }, function (error) {
 console.log(error);
 THIS.log();
 });
 }
 }
 }
 window.ActLogObj = new ActLog();
 */
function logToSD(fileName, data) {
    // window.ActLogObj.addQueue(fileName, data);
}

/* PROBLEMS


 // WORKING FINE
 ip = "speedtest.tele2.net";
 usr = "anonymous";
 pass = "";
 localLoc = "/data/data/com.testing.ftp/files/files/test1.txt";
 uploadLoc = "upload/test1.txt";
 window.cordova.plugin.ftp.upload(localLoc, uploadLoc, ...)



 // NOT WORKING AT ALL
 ip = "ec2-54-147-242-60.compute-1.amazonaws.com";
 usr = "xprize_ftp_testing";
 pass = "asdf";
 localLoc = "/data/data/com.testing.ftp/files/files/test1.txt";
 uploadLoc = "upload/test1.txt";
 window.cordova.plugin.ftp.upload(localLoc, uploadLoc, ...)

 -- Timed out


 // WORKING JUUUS FINE
 ip = "ec2-54-147-242-60.compute-1.amazonaws.com";
 usr = "xprize_ftp_testing";
 pass = "asdf";
 window.cordova.plugin.ftp.mkdir("upload/asdf", ...)

 // Timed out
 window.cordova.plugin.ftp.ls("upload/", ...)

 */


