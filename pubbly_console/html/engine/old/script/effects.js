function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}
var curFX;
function error(e, msg) {
	if (msg) {
		console.log(msg + " Error object follows...");
	}
	console.log(e);
}
function findBoundingRect(poly) {
	// top left bottom right
	var boundingRect = [pUnit, pUnit, 0, 0];
	for (pt in poly) {
		var x = poly[pt].x;
		var y = poly[pt].y;
		if (x > boundingRect[3]) {
			boundingRect[3] = x
		}
		if (x < boundingRect[1]) {
			boundingRect[1] = x
		}
		if (y > boundingRect[2]) {
			boundingRect[2] = y
		}
		if (y < boundingRect[0]) {
			boundingRect[0] = y
		}
	}
	return boundingRect;
}
function startFX(pageElem, lnkPoly, pt) {
	var rect = findBoundingRect(lnkPoly);
	var can = pageElem.CAN;
	var buf = pageElem.BUF;
	var img = false;
	try {
		img = can.getContext('2d').getImageData(0, 0, maxDim[0], maxDim[1]);
	}
	catch (e) {
		error(e, "Cannot use effect on a local computer running chrome. If this is a server, please allow cross-origin data.");
	}
	if (img) {
		// Pick an effect here
		// NOTE all effect WILL take the very same first args
		// ctx, btx, img, rect
		curFX = new Ripple(can, buf, lnkPoly, rect, pt, pageElem.CAN.height, pageElem.CAN.width);
	}
}
function Ripple(can, buf, poly, rect, pt, height, width) {
	var vertRatio = can.height / parseInt(can.style.height);
	var horiRatio = can.width / parseInt(can.style.width);
	// rect in top, left, bottom, right
	rect[0] *= vertRatio;
	rect[2] *= vertRatio;
	rect[1] *= horiRatio;
	rect[3] *= horiRatio;
	var ctx = can.getContext("2d");
	var btx = buf.getContext("2d");
	var tmpImageData = ctx.getImageData(rect[1], rect[0], rect[3] - rect[1], rect[2] - rect[0]);
	var imgInChunks = [];
	var cur = tmpImageData.data;
	for (var px = 0; px < tmpImageData.data.length; px += 4) {
		imgInChunks.push([[cur[px]], [cur[px + 1]], [cur[px + 2]], [cur[px + 3]]]);
	}
	console.log("done");
	var circleTimer = window.setInterval(function () {
		ctx.putImageData(tmpImageData, rect[1], rect[0]);
	}, 20);
}



