<?php

chdir("../../");
require_once("config.php");
require_once(WEB_ROOT . "/php/main.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(CLASS_ROOT . "/mysql_query.php");
if (LOGGED_IN) {
    $query = new Mysql_query();
    echo $query->fetchArrayAsJSON("SELECT * FROM map", []);
}