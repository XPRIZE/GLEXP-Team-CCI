<?php

require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(CLASS_ROOT . "/mysql_query.php");
require_once(WEB_ROOT . "/php/main.php");

if (LOGGED_IN) {
    require_once(CLASS_ROOT . "/html_fragment.php");
    if (ENVIRONMENT === "fastrackids") {
        $html = new Html_fragment("html/index.html", [
            ["HOMEPAGE_LOGO", "assets/fastracKids.png"]
        ]);
    }   else    {
        $html = new Html_fragment("html/index.html", [
            ["HOMEPAGE_LOGO", "assets/logo.png"]
        ]);
    }
    $html->echoOut();
} else {
    header("Location: login.php");
}