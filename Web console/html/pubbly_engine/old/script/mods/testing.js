var TestObject = function () {
    console.clear();
    this.pages = [];
    for (var p = 0; p < book.length; p++) {
        this.pages.push(new TestingPage(p))
    }
    addTestingInterface();
    console.log(this);
};
var TestingPage = function (which) {
    this.interactions = {};
    this.interactions.clicks = [];
    for (var c = 0; c < book[which].clicks.length; c++) {
        this.interactions.clicks.push({
            "triggered": false,
            "completed": false,
            "errors": 0,
        });
    }
    /*
     this.clicks = ;
     this.buttons = new Array(book[p].clicks.length);
     this.drops = new Array(book[p].clicks.length);
     this.lineEnds = new Array(book[p].clicks.length);
     this.lineStarts = new Array(book[p].clicks.length);
     this.logics = new Array(book[p].clicks.length);
     this.logics = new Array(book[p].clicks.length);
     */
};

function addTestingInterface() {
    var testingCont = document.createElement("div");
    testingCont.setAttribute("id", "testingCont");
    testingCont.setAttribute("status", "closed");
    document.getElementById("topBit").appendChild(testingCont);

    var graphWrapper = document.createElement("div");
    graphWrapper.setAttribute("id", "graphWrapper");
    document.body.appendChild(graphWrapper);

    var graphCont = document.createElement("div");
    graphCont.setAttribute("id", "graphCont");
    graphWrapper.appendChild(graphCont);

    for (var p = 0; p < book.testObj.length; p++) {
        var cur = book.testObj[p];
        for (l = 0; l < cur.interactions.length; l++) {
            var lnk = cur.interactions[l];

        }
    }
}






































