/**
 * Created by Jason on 11/3/2016.
 */

function FileUploader() {
    var THIS = this;
    this.list = [];

    this.form = document.createElement("form");
    this.form.setAttribute("style", "display:none"); // hide the useless upload form
    document.body.appendChild(this.form);
    this.choose = document.createElement("input");
    this.choose.setAttribute("type", "file");
    this.choose.setAttribute("id", "fileChooser");
    this.choose.setAttribute("name", "fileChooser");
    this.form.appendChild(this.choose);
    this.submit = document.createElement("input");
    this.submit.setAttribute("type", "submit");
    this.form.appendChild(this.submit);
    $(this.form).css({"padding": 0, "margin": 0});

    this.refreshObj = false;


    this.form.addEventListener('submit', function (e) {
	var FORM = this;
	e.preventDefault();
	var file = this.fileChooser.files[0];
	if (file.type == "image/png" || file.type == "image/jpg" || file.type == "image/jpeg") {
	    var url = '../../ajax/bookCalls/uploadImage.php?';
	    var imgUrl = window.location.pathname.split('/');
	    imgUrl.shift();
	    imgUrl.pop();
	    imgUrl.push("images");
	    url += "imgUrl=" + imgUrl.join("/");
	    var formData = new FormData(this);
	    formData.append("section", "general");
	    formData.append('action', 'previewImg');
	    formData.append('image', file);
	    $.ajax({
		type: "POST",
		url: url,
		data: formData,
		contentType: false,
		processData: false,
		success: function (imgName) {
		    FORM.reset(); // Clear file input, now the "change" event listener will actually listen for a duplicate file name upload.
		    delete THIS.refreshObj.elem.onload;

		    THIS.refreshObj.elem.src = "images/tmp/" + imgName + noCacheExt();
		    THIS.refreshObj.elem.onerror = function (e, meg) {
			book.bugs.log("Snapshot did not load, please try again");
		    }
		    THIS.refreshObj.elem.onload = function () {
			book[curPage - 1].redraw();
			if (curSequence) {
			    curSequence.next();
			}
		    }
		}
	    });
	} else {
	    book.bugs.log("Error: only JPGs and PNGs allowed");
	}
    });

    this.choose.addEventListener("change", function () {
	$(THIS.submit).trigger("click");
    }, false);

    this.uploadImage = function (obj) {
	this.refreshObj = obj;
	$(this.choose).trigger("click");
    }

    return this;
}