<?php

chdir("../../");
require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(CLASS_ROOT . "/mysql_query.php");
require_once(CLASS_ROOT . "/sec_session.php");
if (LOGGED_IN) {

    $query = new Mysql_query();
    $statics = $query->fetchArrayAsJSON("SELECT e_static_id, `name`, folder, pages FROM e_static ORDER BY `name` ASC", []);
    echo $statics;
}