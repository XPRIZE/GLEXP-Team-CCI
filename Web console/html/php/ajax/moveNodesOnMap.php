<?php

$nodePlacements = isset($_GET['nodePlacements']) ? $_GET['nodePlacements'] : $_POST['nodePlacements'];
$nodePlacements = json_decode($nodePlacements, TRUE);
chdir("../../");
require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(WEB_ROOT . "/php/main.php");
require_once(CLASS_ROOT . "/mysql_query.php");
require_once(CLASS_ROOT . "/sec_session.php");
if (LOGGED_IN && isset($nodePlacements)) {
    $query = new Mysql_query();
    foreach ($nodePlacements as $node) {
        if (isset($node['x'])) {
            $nodeID = $node['node_id'];
            $x = intval($node['x']);
            $y = intval($node['y']);
            $query->execSingle("UPDATE map_node SET x = ?, y = ? WHERE map_node_id = ?", ["sss", $x, $y, $nodeID]);
        }
    }
    echo "done";
}