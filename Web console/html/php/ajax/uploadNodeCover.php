<?php

$nodeID = $_GET['nodeID'];
$mapName = $_POST['mapName'];
chdir("../../");
require_once("config.php");
require_once(WEB_ROOT . "/php/main.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(CLASS_ROOT . "/mysql_query.php");
if (LOGGED_IN) {
    $query = new Mysql_query();
    $fsLoc = $query->fetchSingle("SELECT CONCAT('map/', m.name, '/', mn.name, '/cover.png') AS loc FROM map_node mn LEFT JOIN map m ON mn.map_id = m.map_id WHERE map_node_id = ?", ["s", $nodeID]);
    $file = isset($_FILES['upload']) ? $_FILES['upload'] : false;
    if ($file && $fsLoc) {
        $fileLoc = $file['tmp_name'];
        $fileName = $file['name'];
        rename($fileLoc, $fsLoc);
        $query->execSingle("UPDATE map_node SET has_cover = 1 WHERE map_node_id = ?", ["s", $nodeID]);

        header("location: ../../edit_map.php?mapName=".base64_encode($mapName));
    } else {
        echo "Fail, no node or map or whatever";
    }
}