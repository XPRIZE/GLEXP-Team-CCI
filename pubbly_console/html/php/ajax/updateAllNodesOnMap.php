<?php

$mapID = $_GET['mapID'];

chdir("../../");
require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(WEB_ROOT . "/php/main.php");
require_once(WEB_ROOT . "/php/nodeMovements.php");
require_once(WEB_ROOT . "/php/saveXML.php");
require_once(CLASS_ROOT . "/mysql_query.php");
require_once(CLASS_ROOT . "/html_fragment.php");
require_once(CLASS_ROOT . "/sec_session.php");

$latestEngineRelease = file_get_contents("pubbly_engine/version.txt");
if (LOGGED_IN) {
    $query = new Mysql_query();
    $mapName = $query->fetchSingle("SELECT name FROM map WHERE map_id = ?", ["s", $mapID]);
    $nodes = $query->fetchRows("SELECT map_node_id, name, child_id, book_id, unit_id FROM map_node WHERE map_id = ?", ["s", $mapID]);
    foreach ($nodes as $node) {
        $toName = $node['name'];
        $id = $node['map_node_id'];
        if (isset($node['child_id'])) {
            $fromType = "variable";
            $fromID = $node['child_id'];
        } else if (isset($node['book_id'])) {
            $fromType = "static";
            $fromID = $node['book_id'];
        } else if (isset($node['unit_id'])) {
            $fromType = "unit";
            $fromID = $node['unit_id'];
        }
        $xmlFromLoc = getXmlLocFromNodeTypeAndId($fromType, $fromID);
        if ($fromType === "variable") {
            $assetPrefix = "C" . $query->fetchSingle("SELECT childID FROM children WHERE child_id = ?", ["s", $fromID]) . "_";
        } else {
            $assetPrefix = "";
        }
        $toLoc = "map/$mapName/$toName";
        // Legacy support
        if (!is_dir("$toLoc/videos")) {
            mkdir("$toLoc/videos");
        }
        moveNodeXmlToNodeFsLoc($xmlFromLoc, $assetPrefix, "$toLoc");
        $frag = new Html_fragment("pubbly_engine/html/server-build.html", [
            ["ENGINE_CODE", $latestEngineRelease],
            ["MAP_NODE_NAME", $toName],
        ]);
        $frag->printOut("map/$mapName/$toName.html");

        $xmlPath = "$toLoc/MainXML.xml";
        // recreates nodes just incase new ones were added
        // If it's a duplicate entry, it fails the foreign key unique check 
        createNodeSkeletonPathsFromXmlDoc($id, $xmlPath);


        $allConnections = $query->fetchRows("SELECT
    frm.map_node_path_id AS map_node_path_id,
    frm.from_link_name AS from_link_name,
    frm.from_link_page AS from_link_page,
    frm.to_node_id AS to_node_id,
    ton.name AS to_node_name
FROM
    map_node_path frm
LEFT JOIN map_node ton ON
    frm.to_node_id = ton.map_node_id
WHERE
    frm.from_node_id = ?", ["s", $id]);
        foreach ($allConnections as $connection) {
            $foundInXml = false;
            $toNodeName = $connection['to_node_name'];
            $url = "?engineCode=new&t=m&mn=$mapName&nn=$toNodeName";

            $xml = simplexml_load_file($xmlPath);
            $xmlPage = $xml->Pages->Page[$connection['from_link_page']];
            foreach ($xmlPage->Links->children() as $xmlLink) {
                if ((string) $xmlLink->Name == $connection['from_link_name']) {
                    foreach ($xmlLink->Triggers->children() as $trigger) {
                        foreach ($trigger->Targets->children() as $target) {
                            if (
                                    ((string) $target->Type == "Page" && (string) $target->Destination == "To be Determined") || ((string) $target->Action == "Has been determined")) {
                                $target->Type = "URL";
                                $target->Action = "Has been determined";
                                $target->Destination = "base64Encoded(" .
                                        base64_encode($url) . ")";
                                $foundInXml = true;
                            }
                        }
                    }
                }
            }
            if (!$foundInXml) {
                $query->execSingle("DELETE FROM map_node_path WHERE map_node_path_id = ?", ["s", $connection['map_node_path_id']]);
            }
            saveXML($xml, "$toLoc/MainXML.xml");
        }
    }
    echo "done";
} else {
    echo "Bad pass for nodeFromType, or not logged in, you figure it out.";
}
