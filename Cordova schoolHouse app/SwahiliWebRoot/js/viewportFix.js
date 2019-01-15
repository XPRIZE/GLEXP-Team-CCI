window.setTimeout(function () {
    if (window.innerWidth !== 1280) {
        viewport = document.querySelector("meta[name=viewport]");
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.1, maximum-scale=1.0, user-scalable=0');
        window.setTimeout(function () {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
        },100);
    }
}, 500);