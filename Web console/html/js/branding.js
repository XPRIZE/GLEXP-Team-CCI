let brand = "XprizeV2";
window.setTimeout(function() {
	let title = document.head.getElementsByTagName("title")[0].innerHTML;
	document.head.getElementsByTagName("title")[0].innerHTML = brand + " " + title;
},1);
