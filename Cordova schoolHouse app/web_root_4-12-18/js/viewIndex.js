document.addEventListener("deviceready", function () {
    viewportFix();
    window.plugins.locktask.startLockTask(function () {
        AndroidFullScreen.showSystemUI(function () {
            cordova.plugins.autoStart.enable();
            window.location.href = "welcome.html";
        }, function (err) {
            alert(err);
        });
    }, function (err) {
        alert(err);
    }, "MyAdmin");
});