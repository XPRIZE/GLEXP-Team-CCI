<?php

chdir("../../");
require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(CLASS_ROOT . "/mysql_query.php");

$oldName = filter_input(INPUT_POST, 'oldName', FILTER_SANITIZE_STRING);
$newName = filter_input(INPUT_POST, 'newName', FILTER_SANITIZE_STRING);

$query = new Mysql_query();
$ret = $query->execSingle("UPDATE map SET name = ? WHERE name = ?", ["ss", $newName, $oldName]);
header('Location: ' . $_SERVER["HTTP_REFERER"]);
rename("map/$oldName", "map/$newName");
exit;
