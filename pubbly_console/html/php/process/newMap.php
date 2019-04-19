<?php

chdir("../../");
require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(CLASS_ROOT . "/mysql_query.php");

$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);

$query = new Mysql_query();
$ret = $query->execSingle("INSERT INTO map (name) VALUES (?)", ["s", $name]);
if ($ret === 1) {
    mkdir("map/$name");
    header('Location: ' . $_SERVER["HTTP_REFERER"]);
    exit;
} else if ($ret === -1) {
    // goBackWithNewErrors(["100"]);
    echo "Name taken... refreshing";
    sleep(3);
    header('Location: ' . $_SERVER["HTTP_REFERER"]);
}
