<?php

chdir("../../");
require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(CLASS_ROOT . "/mysql_query.php");
require_once(CLASS_ROOT . "/sec_session.php");
$query = new Mysql_query();

$requestedName = $_GET["username"];
$taken = $query->fetchSingle("SELECT username FROM user WHERE username = ?", ["s", $requestedName]);
echo ($taken) ? "taken" : "available";
?>