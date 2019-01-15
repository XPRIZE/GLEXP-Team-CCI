function checkDownloadAndGo(url, partialServerLoc) {
    $.ajax({
        type: "GET",
        url: url,
        success: function (ret) {
            window.location.href = url;
        },
        error: function () {
            // showDownloadWindow();
            downloadAndUnzip(partialServerLoc, "0", function () {
                window.location.href = url;
            })
        }
    });
}