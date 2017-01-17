function drawLink(obj) {
	console.clear();

	var page = book[curPage - 1];
	var ctx = page.CAN.getContext('2d');

	var tmpDrawLine = function (obj, colors) {
		if (!colors) {
			colors = [];
			colors.push("#000000");
			colors.push("#C0C0C0");
		}
		ctx.fillStyle = colors[0];
		var pts = obj.pts;
		if (pts) {
			ctx.beginPath();
			ctx.moveTo(pts[0].x, pts[0].y);
			for (var p = 1; p < pts.length; p++) {
				ctx.lineTo(pts[p].x, pts[p].y);
			}
			ctx.fillStyle = colors[1];
			ctx.fill();
			ctx.closePath();
			ctx.stroke();
		} else {
			console.warn("Link had no points, moving on...");
		}

	};

	if (obj) {
		tmpDrawLine(obj);
	} else {
		console.log("No object, so I'll just draw every link on page " + curPage);

		var totLinks = 0;

		var clickColor = ["#000000", "#C0C0C0"];
		var dropColor = ["#800000", "#FF0000"];
		var pageOpensColor = ["#008000", "#00FF00"];
		var lineEndsColor = ["#000080", "#0000FF"];
		var lineStartsColor = ["#808000", "#FFFF00"];

		for (var c = 0; c < page.clicks.length; c++) {
			tmpDrawLine(page.clicks[c], clickColor);
			totLinks++;
		}
		for (var d = 0; d < page.drops.length; d++) {
			tmpDrawLine(page.drops[d], dropColor);
			totLinks++;
		}
		for (var o = 0; o < page.pageOpens.length; o++) {
			tmpDrawLine(page.pageOpens[o], pageOpensColor);
			totLinks++;
		}
		for (var le = 0; le < page.lineEnds.length; le++) {
			tmpDrawLine(page.lineEnds[le], lineEndsColor);
			totLinks++;
		}
		for (var ls = 0; ls < page.lineStarts.length; ls++) {
			tmpDrawLine(page.lineStarts[ls], lineStartsColor);
			totLinks++;
		}
		console.log("Total links: " + totLinks);

		console.log("%c" + "Clicks", "color:" + clickColor[0] + ";font-weight:bold;");
		console.log("%c" + "Drops", "color:" + dropColor[0] + ";font-weight:bold;");
		console.log("%c" + "Page Opens", "color:" + pageOpensColor[0] + ";font-weight:bold;");
		console.log("%c" + "Line Starts", "color:" + lineStartsColor[0] + ";font-weight:bold;");
		console.log("%c" + "Line Ends", "color:" + lineEndsColor[0] + ";font-weight:bold;");

	}
}




/**
 * Created by Jason on 7/19/2016.
 */

function BugHandler() {
	var THIS = this;
	this.bugLength = 5000;
	this.totBugs = 0;
	this.timeouts = {};

	this.bugsToCreate = [];

	this.logInterval = window.setInterval(function () {
		if (THIS.bugsToCreate.length) {
			THIS.showBug(THIS.bugsToCreate[0]);
			THIS.bugsToCreate.shift();
		}
	}, 1);

	this.log = function (what) {
		this.bugsToCreate.push(what);
	};
	this.showBug = function (message) {
		this.totBugs++;
		var curBug = this.totBugs + 1 - 1; // Not sure if a ref will break the connection, probably does, I don't care.
		var visibleBugs = this.totBugs;

		var elem = "";
		elem += "<div class=bugMessageCont id='bug" + visibleBugs + "' onClick='book.bugs.remove(" + curBug + ");'>";
		elem += "<div class=bugMessageContBorder>";
		elem += "<p>" + message + "</p>";
		elem += "</div>";
		elem += "</div>";
		if (!$(".bugMessageCont").length) {
			$("#bugHeader").removeClass("closed");
		}
		this.div.innerHTML += elem;
		this.timeouts[this.totBugs] = window.setTimeout(function () {
			// Autoremoves all bugs after 5 or so seconds.
			// THIS.remove(curBug);
		}, this.bugLength);
	};

	this.stop = function () {
		window.clearInterval(THIS.logInterval);
	};

	this.remove = function (curBug) {
		//delete THIS.timeouts[curBug]; // Necessary?

		if ($("#bug" + curBug)[0]) {
			$("#bug" + curBug).animate(
					{"height": 0},
					100,
					function () {
						$("#bug" + curBug).remove();
						if (!$(".bugMessageCont").length) {
							$("#bugHeader").addClass("closed");
						}
					}
			);
		} else {
			// Already taken care of friendo
		}
	}

	var init = function () {
		var contFixed = document.createElement("div");
		contFixed.setAttribute("id", "bugDivFixed");
		document.body.appendChild(contFixed);

		var gradient = document.createElement("div");
		gradient.setAttribute("id", "bugDivGradient");
		contFixed.appendChild(gradient);

		THIS.div = document.createElement("div");
		THIS.div.setAttribute("id", "bugDiv");
		gradient.appendChild(THIS.div);

		var bugHeader = document.createElement("H2");
		bugHeader.setAttribute("id", "bugHeader");
		bugHeader.setAttribute("class", "closed");
		bugHeader.setAttribute("onclick", "if ($('#bugDiv.min')[0]) {$('#bugDiv').removeClass('min');}else{$('#bugDiv').addClass('min');}");
		THIS.div.appendChild(bugHeader);
		bugHeader.innerHTML = "Book bugs";
	}();
}

window.setTimeout(function () {
	// book.bugs = new BugHandler();
	window.setTimeout(function () {
		// book.bugs.log("Test 3");
	}, 100);
}, 500);