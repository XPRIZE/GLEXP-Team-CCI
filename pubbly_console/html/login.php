<?php

require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(CLASS_ROOT . "/mysql_query.php");
require_once(WEB_ROOT . "/php/main.php");

if (LOGGED_IN) {
    header("Location: index.php");
} else {
    $codes = [
        "000" => "Server has been updated for extra security. Please re-register",
        "100" => "User not found in the Database. Please register",
        "200" => "Password did not match. Please try again",
    ];
    $err = isset($_GET['err']) ? $_GET['err'] : false;
    if ($err) {
        if (isset($codes[$err])) {
            $err = $codes[$err];
        } else {
            $err = "Server error, please try again later";
        }
    } else {
        $err = "Server has been updated for extra security. Please re-register";
        $err = "";
    }

    require_once(CLASS_ROOT . "/html_fragment.php");
    $html = new Html_fragment("html/login.html", [
        ["ERROR_MESSAGE", $err]
    ]);
    $html->echoOut();
}