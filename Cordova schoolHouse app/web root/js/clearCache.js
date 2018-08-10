function clearCache() {
    if (device.platform == "browser") {
	console.log("Browser, do it your dang self");
    } else {
	window.cache.clear(function (status) {
	    log('Message: ' + status);
	}, function (status) {
	    alert('Error clearing cache: ' + status);
	});
    }
}


