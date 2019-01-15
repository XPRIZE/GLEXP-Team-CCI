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
	    console.warn("Warning: " + "Link had no points, moving on...");
	}

    };

    if (obj) {
	tmpDrawLine(obj);
    } else {

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
    }
}