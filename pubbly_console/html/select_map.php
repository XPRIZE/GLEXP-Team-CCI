<?php

// $programName = base64_decode($_GET['program_name']);
//  && isset($programName)
require_once("config.php");
require_once(WEB_ROOT . "/php/main.php");
require_once(CLASS_ROOT . "/html_fragment.php");

if (LOGGED_IN) {
    $frag = new Html_fragment("html/select_map.html", []);
    $frag->echoOut();
} else {
    header("Location: login.php");
}