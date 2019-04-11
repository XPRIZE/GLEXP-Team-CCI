<?php

require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(CLASS_ROOT . "/mysql_query.php");
require_once(WEB_ROOT . "/php/main.php");

if (LOGGED_IN) {
    require_once(CLASS_ROOT . "/html_fragment.php");
    $html = new Html_fragment("html/static_exports.html", []);
    $html->echoOut();
} else {
    header("Location: login.php");
}