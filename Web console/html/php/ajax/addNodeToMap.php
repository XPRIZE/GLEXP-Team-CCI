<?php

$mapID = $_GET['mapID'];
$nodeFromType = $_GET['nodeFromType'];
$nodeFromID = $_GET['nodeFromID'];
$nodeX = isset($_GET['x']) ? $_GET['x'] : 0;
$nodeY = isset($_GET['y']) ? $_GET['y'] : 0;

chdir("../../");
require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(WEB_ROOT . "/php/main.php");
require_once(WEB_ROOT . "/php/nodeMovements.php");
require_once(CLASS_ROOT . "/mysql_query.php");
require_once(CLASS_ROOT . "/sec_session.php");
if (LOGGED_IN && in_array($nodeFromType, ["static", "variable", "unit"])) {
    $nodeFsName = genNodeFsName($nodeFromType, $nodeFromID);
    $nodeID = createNodeEntryInDB($mapID, $nodeFromType, $nodeFromID, $nodeFsName, $nodeX, $nodeY);
    if ($nodeID) {
        $xmlLoc = getXmlLocFromNodeTypeAndId($nodeFromType, $nodeFromID);
        $paths = createNodeSkeletonPathsFromXmlDoc($nodeID, $xmlLoc);
        $xmlFromLoc = getXmlLocFromNodeTypeAndId($nodeFromType, $nodeFromID);
        // Stupid child prefix shit.
        $query = new Mysql_query();
        if ($nodeFromType === "variable") {
            $assetPrefix = "C" . $query->fetchSingle("SELECT childID FROM children WHERE child_id = ?", ["s", $nodeFromID]) . "_";
        } else {
            $assetPrefix = "";
        }
        $mapName = $query->fetchSingle("SELECT name FROM map WHERE map_id = ?", ["s", $mapID]);
        mkdir("map/$mapName/$nodeFsName");
        mkdir("map/$mapName/$nodeFsName/images");
        mkdir("map/$mapName/$nodeFsName/audio");
        mkdir("map/$mapName/$nodeFsName/videos");
        moveNodeXmlToNodeFsLoc($xmlFromLoc, $assetPrefix, "map/$mapName/$nodeFsName");
        
        // No need to query, it's new, so it's default shit anyway.
        $fakeJSON = [
            "name" => $nodeFsName,
            "cover" => 0,
            "links" => [],
            "node_id" => $nodeID
        ];
        echo json_encode($fakeJSON);
    } else {
        echo "Error: Duplicate node on map";
    }
} else {
    echo "Bad pass for nodeFromType, or not logged in, you figure it out.";
}

