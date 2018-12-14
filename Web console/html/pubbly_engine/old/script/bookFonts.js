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
			if (isCordova) {
				this.list[name].src = "fonts/" + file + ".ttf";
			}	else	{
				this.list[name].src = "../../../../../bookDependencies/production/R16/fonts/" + file + ".ttf";
				console.log(this.list[name].src);
			}
			var src = this.list[name].src;
			this.addElem(name);
			this.addStyle(src, name);
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
	this.addStyle = function (src, name) {
		this.styleSheet.insertRule("@font-face { font-family: '" + name + "'; src: url('" + src + "'); }", 0);
	}
}
