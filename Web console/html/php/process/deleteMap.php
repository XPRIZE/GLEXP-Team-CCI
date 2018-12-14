<?php

chdir("../../");
require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(CLASS_ROOT . "/mysql_query.php");
require_once(WEB_ROOT . "/php/rrmdir.php");

$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
// $name = preg_replace("/[^a-zA-Z0-9]+/", "", $name);
// New map! ../../*
$query = new Mysql_query();
$ret = $query->execSingle("DELETE FROM map WHERE name = ?", ["s", $name]);
if ($ret) {
    rrmdir("map/$name");
}
header('Location: ' . $_SERVER["HTTP_REFERER"]);
exit;
