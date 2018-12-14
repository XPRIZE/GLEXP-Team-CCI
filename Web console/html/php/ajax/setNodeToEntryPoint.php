<?php

$nodeID = $_GET['nodeID'];

chdir("../../");
require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(WEB_ROOT . "/php/main.php");
require_once(CLASS_ROOT . "/mysql_query.php");
require_once(CLASS_ROOT . "/sec_session.php");
if (LOGGED_IN && $nodeID) {
    $query = new Mysql_query();
    $map_id = $query->fetchSingle("SELECT mp.map_id FROM map mp LEFT JOIN map_node mn ON mp.map_id = mn.map_id WHERE mn.map_node_id = ?", ["s", $nodeID]);
    // clears all if any
    $query->execSingle("UPDATE map_node SET is_entry = 0 WHERE map_id = ?", ["s", $map_id]);
    $query->execSingle("UPDATE map_node SET is_entry = 1 WHERE map_node_id = ?", ["s", $nodeID]);
    $info = $query->fetchArray("SELECT CONCAT('map/', mp.name) AS path, mn.name AS entry FROM map_node mn LEFT JOIN map mp ON mn.map_id = mp.map_id WHERE mn.map_node_id = ?", ["s", $nodeID]);
    $path = $info['path'];
    $entryName = $info['entry'];
    if (file_exists("$path/entryPoint.php")) {
        unlink("$path/entryPoint.php");
    }
    if (file_exists("$path/entryPoint.txt")) {
        unlink("$path/entryPoint.txt");
    }
    file_put_contents("$path/entryPoint.php", '<?php $entryPoint="'.$entryName.'"; ?>');
    file_put_contents("$path/entryPoint.txt", "$entryName");
    echo "done";
} else {
    echo "Bad pass for nodeFromType, or not logged in, you figure it out.";
}