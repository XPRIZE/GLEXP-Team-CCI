/*
Thrown together last minute JS to create at least some semblence of data collection for Xprize field test
Saves EVERY pubbly sequence event alongside a UNIX timestamp.

Partially used after the fact to get some idea of which books were favored, when each reader would read, and how usage changed over time.

*/

function retStamp() {
    return parseInt(Date.now()).toString();
}

function Analytics() {
    var self = this;
    this.fName = false;
    this.fullObj = {};

    this.retStamp = function () {
        var now = parseInt(Date.now()).toString();
        return now;
    }
    this.init = function (cb) {
        var url = window.location.pathname.split("/");
        var book = url.pop().split(".")[0];
        var subject = url.pop();
		// To match older versions, old engine, god.
		if (url.pop() !== "Epic%20Quest") {
			url = window.location.pathname.split("/");
			url.pop(); // index.html
			book = url.pop();
			subject = url.pop();
		}
		if (typeof login === "undefined") {
			console.warn("Error: Analytics cannot initialize, user not logged in");
		}	else	{
			login(function (uid) {
				readFile("users/" + uid + "/analytics.json", function (ret) {
					var name = uid + "-" + subject + "-" + book + "-analitics-" + self.retStamp() + "";
					self.fName = "users/" + btoa(name) + ".json";
					var bookOpenLoc = {type: "bo", recordLoc: self.fName};
					var analyticsMain = JSON.parse(ret);
					analyticsMain.records[self.retStamp()] = bookOpenLoc;
					writeFile("users/" + uid + "/analytics.json", JSON.stringify(analyticsMain), function () {
						self.add({
							type: "book open",
							bookName: book,
							subjectName: subject,
							fName: self.fName,
						});
						if (cb)
							cb();
					});
				});
			}, function (err) {
				console.log(err);
				var name = "anon" + "-" + subject + "-" + book + "-analitics-" + self.retStamp() + "";
				self.fName = "users/" + btoa(name) + ".json";
				self.add({
					type: "book open",
					bookName: book,
					subjectName: subject,
					fName: self.fName,
				});
				if (cb)
					cb();
			});
		}
        

    };

    this.add = function (what, cb) {
        var stamp = self.retStamp();
        if (this.fullObj[stamp]) {
            var num = 1;
            while (this.fullObj[stamp + "-" + num]) {
                num++;
            }
            this.fullObj[stamp + "-" + num] = what;
        } else {
            this.fullObj[stamp] = what;
        }

        this.save(function () {
            if (cb)
                cb();
        });
    };
    this.save = function (cb) {
        // maybe use overwrite?
        // console.log("writting");
		if (typeof writeFile === "undefined") {
		}	else	{
			writeFile(self.fName, JSON.stringify(self.fullObj), function (ret) {
				if (ret) {
					console.log("File written");
				}
				if (cb)
					cb();
			});
		}
        
    };
    this.check = function () {
		if (typeof readFile === "undefined") {
		}	else	{
			readFile(this.fName, function (file) {
				console.log(file);
			})
		}
        
    }


    this.init();
}


