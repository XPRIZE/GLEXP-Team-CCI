<?php

function loginCheck() {
    if (file_exists("config.php")) {
        require_once("config.php");
    } else if (file_exists("../config.php")) {
        require_once("../config.php");
    } else if (file_exists("../../config.php")) {
        require_once("../../config.php");
    }
    require_once(INC_ROOT . "/dbConnect.php");
    require_once(CLASS_ROOT . "/mysql_query.php");
    require_once(WEB_ROOT . "/php/main.php");

    if (LOGGED_IN) {
        return true;
    }
}

?>