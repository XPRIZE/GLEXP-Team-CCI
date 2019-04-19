<?php

require_once("config.php");
require_once(WEB_ROOT . "/php/main.php");
require_once(CLASS_ROOT . "/html_fragment.php");

if (!LOGGED_IN) {
    header("Location: index.php");
} else {
    $frag = new Html_fragment("html/select_unit.html", []);
    $frag->echoOut();
}