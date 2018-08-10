document.addEventListener("deviceready", function () {
    window.addEventListener("batterystatus", onBatteryStatus, false);

    viewportFix();
    // cordova.plugins.autoStart.enable();

    function getValByTag(node, tag) {
        if (node && node.getElementsByTagName(tag).length && node.getElementsByTagName(tag)[0].innerHTML) {
            return node.getElementsByTagName(tag)[0].innerHTML;
        } else {
            return false;
        }
    }


    $("#tutorial").click(function () {
        gotoTutorial();
    });
    $("#promptLeft").click(function () {
        gotoTutorial();
    });
    $("#login").click(function () {
        gotoLogin();
    });
    $("#promptRight").click(function () {
        gotoLogin();
    });

    function gotoLogin() {
        window.location.href = "login.html";
    }

    function gotoTutorial() {
        $.ajax({
            type: "GET",
            url: schoolLoc + "/school.xml", // not modified, who cares, just getting bg image
            dataType: "xml",
            success: function (xml) {
                window.schoolXML = xml;
                var bgSrc = getValByTag(xml, "schoolBG");
                var initTutorial = "";
                var tuts = schoolXML.getElementsByTagName("tutorial");
                for (var t = 0; t < tuts.length; t++) {
                    var tut = tuts[t];
                    if (getValByTag(tuts[t], "type") == "app") {
                        initTutorial = getValByTag(tuts[t], "name");
                    }
                }
                if (initTutorial) {
                    window.location.href = schoolLoc + "/tutorials/" + initTutorial + "/index.html";
                } else {
                    console.log("No initial tutorial found in XML, no initial launch");
                    window.location.href = "login.html";
                }

            },
            error: function () {
                console.error("School xml did not load");
            }
        });
    }
});