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

        // to reverse
        // "15" + 04202344 + "000"
        // saves 5 chars per stamp, accurate to the second until 2020.
    }
    this.init = function (cb) {
        var url = window.location.pathname.split("/");
        url.pop(); // index.html
        var book = url.pop();
        var subject = url.pop();
        login(function (uid) {
            readFile("users/" + uid + "/analytics.json", function (ret) {
                // var name = uid + "-" + window.location.pathname + "-analytics-" + self.retStamp() + "";
                var name = uid + "-" + window.location.pathname + "-analytics-" + self.retStamp() + "";
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
            var name = "anon" + "-" + window.location.pathname + "-analytics-" + self.retStamp() + "";
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
        writeFile(self.fName, JSON.stringify(self.fullObj), function (ret) {
            if (ret) {
                console.log("File written");
            }
            if (cb)
                cb();
        });
    };
    this.check = function () {
        readFile(this.fName, function (file) {
            console.log(file);
        })
    }


    this.init();
}

window.addEventListener("popstate", function (e) {
    e.preventDefault();
    book.analytics.add({type: "bc"}, function () {
        window.history.back();
    });
    window.setTimeout(function () {
        window.history.back();
    }, 2000);
});
