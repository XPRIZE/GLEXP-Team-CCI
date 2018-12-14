<?php

$nodeID = $_GET['nodeID'];

chdir("../../");
require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(WEB_ROOT . "/php/main.php");
require_once(CLASS_ROOT . "/mysql_query.php");
require_once(CLASS_ROOT . "/sec_session.php");
if (LOGGED_IN) {
    $query = new Mysql_query();
    $info = $query->fetchArray("SELECT mp.name AS map_name, mn.name AS node_name FROM map mp RIGHT JOIN map_node mn ON mn.map_id = mp.map_id WHERE mn.map_node_id = ?", ["s", $nodeID]);
    $nodeName = $query->fetchSingle("SELECT name FROM map_node WHERE map_node_id = ?", ["s", $nodeID]);
    if ($info['map_name'] && $info['node_name']) {
        require_once(WEB_ROOT . '/php/recursives.php');
        rrmdir("map/".$info['map_name']."/".$info['node_name']);
        $query->execSingle("DELETE FROM map_node WHERE map_node_id = ?", ["s", $nodeID]);
        echo "done";
    } else {
        echo "Error: No node found";
    }
} else {
    echo "Bad pass for nodeFromType, or not logged in, you figure it out.";
}