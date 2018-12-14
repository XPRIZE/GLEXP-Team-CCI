$(document).ready(function () {
    let logosAndLogout = webix.ui({
        container: "logoAndLogout",
        css: "whiteBG",
        height: 150,
        cols: [
            {},
            {width: 200,
                rows: [
                    {template: "<img id=logo style='height:150px' src='" + window.homepageLogoSrc + "' />"},
                ]
            },
            {},
            {width: 200},
            {},
            {width: 200},
            {},
            {width: 100},
            {width: 100, rows: [
                    {view: "label", label: "L O G O U T", css: "hoverHand",
                        on: {
                            onItemClick: function () {
                                window.location.href = "logout.php";
                            }},
                    },
                    {},
                ]},
            {},
        ],
    })
    let consoleSections = webix.ui({
        container: "consoleSections",
        css: "whiteBG",
        rows: [
            {cols: [
                    {},
                    {view: "button", value: "MAPS", height: 200, width: 200, css: "greyBtn",
                        on: {
                            onItemClick: function () {
                                window.location.href = "select_map.php";
                            },
                        }
                    },
                    {},
                    {view: "button", value: "STITCH APP", height: 200, width: 200, css: "greyBtn",
                        on: {
                            onItemClick: function () {
                                window.location.href = "select_unit.php";
                            },
                        }
                    },
                    {},
                    {view: "button", value: "VARIABLE EXPORTS", height: 200, width: 200, css: "greyBtn",
                        on: {
                            onItemClick: function () {
                                window.location.href = "variable_exports.php";
                            },
                        }
                    },
                    {},
                    {view: "button", value: "STATIC EXPORTS", height: 200, width: 200, css: "greyBtn",
                        on: {
                            onItemClick: function () {
                                window.location.href = "static_exports.php";
                            },
                        }
                    },
                    {},
                ],
            },
            {cols: [
                    {},
                    {width: 200},
                    {},
                    {width: 200},
                    {},
                    {width: 200},
                    {},
                    {
                        cols: [
                            {template: "<img style='height:48;width:200' src='assets/powered_by_pubbly.png' />", width: 200, height:48},
                        ]
                    },
                    {},
                ]},
            {},
        ]
    });
    $(window).resize(function () {
        logosAndLogout.resize();
        consoleSections.resize();
    });
    logosAndLogout.resize();
    consoleSections.resize();
})