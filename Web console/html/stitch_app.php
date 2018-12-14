<?php

require_once("config.php");
require_once(WEB_ROOT . "/php/main.php");
require_once(CLASS_ROOT . "/html_fragment.php");

if (!LOGGED_IN) {
    header("Location: index.php");
} else {
    $frag = new Html_fragment("html/stitch_app.html", [
        ["SCHOOL_NAME", $_GET['schoolName']],
        ["SUBJECT_NAME", ($_GET['subjectName']) ? $_GET['subjectName'] : false],
        ["LEVEL_NAME", ($_GET['levelName']) ? $_GET['levelName'] : false],
        ["UNIT_NAME", $_GET['unitName']],
        ["IS_TUTORIAL", isset($_GET['isTutorial'])],
    ]);
    $frag->echoOut();
}