function FontHandler() {
    this.elems = {};
    this.list = {};
    this.styleSheet = (function () {
	var style = document.createElement("style");
	style.appendChild(document.createTextNode(""));
	document.head.appendChild(style);
	return style.sheet;
    })();
    this.add = function (file, name) {
	if (this.list[name]) {
	    return this.list[name];
	} else {
	    this.list[name] = {};
	    this.list[name].name = name;
	    this.list[name].file = file;
	    this.list[name].src = "fonts/" + file + ".ttf";
	    this.addElem(name);
	    this.addStyle(file, name);
	    book[curPage - 1].redraw();
	}
    }
    this.addElem = function (name) {
	this.elems[name] = document.createElement('p');
	document.body.appendChild(this.elems[name]);
	$(this.elems[name]).html("A");
	// display none doesn't load font. For reasons...
	$(this.elems[name]).css({"visibility": "hidden", "margin": 0, "height": 0, "font-family": name});
    }
    this.addStyle = function (file, name) {
	this.styleSheet.insertRule("@font-face { font-family: '" + name + "'; src: url('../fonts/" + file + ".ttf'); }", 0);
    }
}