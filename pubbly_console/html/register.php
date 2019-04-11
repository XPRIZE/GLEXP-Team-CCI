<?php

require("config.php");
require(CLASS_ROOT . "/html_fragment.php");
$errors = (isset($_GET['errors'])) ? $_GET['errors'] : "";
if (ENVIRONMENT === "sandbox") {
    $frag = new Html_fragment("html/register_with_conditions.html", [
        ["ERROR_LIST", $errors],
    ]);
} else {
    if (defined("OPEN_REGISTRATION") && OPEN_REGISTRATION) {
        $frag = new Html_fragment("html/register.html", [
            ["ERROR_LIST", $errors],
        ]);
    }   else    {
        $frag = new Html_fragment("html/closedRegistration.html", []);
    }
    
}

$frag->echoOut();
