document.addEventListener("deviceready", function () {
    viewportFix();
    window.plugins.locktask.startLockTask(function () {
        if (typeof AndroidFullScreen !== "undefined") {
            AndroidFullScreen.showSystemUI(function () {
                cordova.plugins.autoStart.enable();
                window.location.href = "welcome.html?firstLaunch";
            }, function (err) {
                alert(err);
            });
        } else {
            // Full screen request either denied or plugin missing
            window.location.href = "welcome.html?firstLaunch";
        }
    }, function (err) {
        alert(err);
    }, "MyAdmin");
});