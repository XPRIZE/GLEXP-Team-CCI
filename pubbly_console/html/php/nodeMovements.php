<?php

function moveNodeXmlToNodeFsLoc($xmlFromLoc, $fromAssetPrefix, $toLoc) {
    require_once(WEB_ROOT . "/php/recursives.php");
    copy("$xmlFromLoc", "$toLoc/MainXML.xml");

    $copyRoot = explode("/", $xmlFromLoc);
    array_pop($copyRoot);
    $copyRoot = implode("/", $copyRoot);
    if ($fromAssetPrefix === "") {
        rcopy("$copyRoot/images", "$toLoc/images");
        rcopy("$copyRoot/audio", "$toLoc/audio");
        rcopy("$copyRoot/videos", "$toLoc/videos");
    } else {
        foreach (glob("$copyRoot/images/$fromAssetPrefix" . "*") as $imgPath) {
            $imgName = getFileInPathString($imgPath);
            rcopy("$copyRoot/images/$imgName", "$toLoc/images/$imgName");
        }
        foreach (glob("$copyRoot/images/P_*") as $imgPath) {
            $imgName = getFileInPathString($imgPath);
            rcopy("$copyRoot/images/$imgName", "$toLoc/images/$imgName");
        }
        foreach (glob("$copyRoot/audio/$fromAssetPrefix" . "*") as $audPath) {
            $audName = getFileInPathString($audPath);
            rcopy("$copyRoot/audio/$audName", "$toLoc/audio/$audName");
        }
        foreach (glob("$copyRoot/audio/P_*") as $audPath) {
            $audName = getFileInPathString($audPath);
            rcopy("$copyRoot/audio/$audName", "$toLoc/audio/$audName");
        }
        foreach (glob("$copyRoot/videos/$fromAssetPrefix" . "*") as $vidPath) {
            $vidName = getFileInPathString($vidPath);
            rcopy("$copyRoot/videos/$vidName", "$toLoc/videos/$vidName");
        }
        foreach (glob("$copyRoot/videos/P_*") as $vidPath) {
            $vidName = getFileInPathString($vidPath);
            rcopy("$copyRoot/videos/$vidName", "$toLoc/videos/$vidName");
        }
    }
}

function createNodeSkeletonPathsFromXmlDoc($nodeID, $xmlLoc) {
    require_once(CLASS_ROOT . "/mysql_query.php");
    $query = new Mysql_query();
    $xml = simplexml_load_file($xmlLoc);
    $p = -1;
    foreach ($xml->Pages->children() as $page) {
        $p++;
        foreach ($page->Links->children() as $link) {
            foreach ($link->Triggers->children() as $trigger) {
                foreach ($trigger->Targets->children() as $target) {
                    if ((string) $target->Type == "Page" && (string) $target->Destination == "To be Determined") {
                        $linkName = (string) $link->Name;
                        $query->execSingle("INSERT INTO map_node_path (from_node_id, from_link_name, from_link_page) VALUES (?, ?, ?)", ['sss', $nodeID, $linkName, $p]);
                    }
                }
            }
        }
    }
}

function getXmlLocFromNodeTypeAndId($type, $id) {
    require_once(CLASS_ROOT . "/mysql_query.php");
    $query = new Mysql_query();
    if ($type === "static") {
        $queryStr = "SELECT CONCAT('books/', ID, '/MainXML.xml') AS loc FROM books WHERE ID = ?";
    } else if ($type === "variable") {
        $queryStr = "SELECT CONCAT('series/', srs.name, '/', cld.childName, '.xml') AS loc FROM children cld LEFT JOIN series srs ON cld.seriesName = srs.name WHERE child_id = ?";
    } else if ($type === "unit") {
        $queryStr = "SELECT CONCAT('schools/', sch.name, '/', sub.name, '/', lvl.name, '/', unt.name, '/MainXML.xml') AS fsName FROM units unt LEFT JOIN levels lvl ON unt.levelID = lvl.ID LEFT JOIN subjects sub ON unt.subjectID = sub.ID LEFT JOIN schools sch ON unt.schoolID = sch.ID WHERE unt.ID = ?";
    }
    return $query->fetchSingle($queryStr, ["s", $id]);
}

function createNodeEntryInDB($mapID, $nodeType, $nodeFromID, $nodeName, $nodeX, $nodeY) {
    require_once(CLASS_ROOT . "/mysql_query.php");
    $query = new Mysql_query();
    $queryStr = "INSERT INTO map_node (map_id, name, child_id, book_id, unit_id, x, y) VALUES (?, ?, ?, ?, ?, ?, ?)";
    if ($nodeType === "static") {
        $id = $query->execSingleGetLastID($queryStr, ["sssssss", $mapID, $nodeName, null, $nodeFromID, null, $nodeX, $nodeY]);
    } else if ($nodeType === "variable") {
        $id = $query->execSingleGetLastID($queryStr, ["sssssss", $mapID, $nodeName, $nodeFromID, null, null, $nodeX, $nodeY]);
    } else if ($nodeType === "unit") {
        $id = $query->execSingleGetLastID($queryStr, ["sssssss", $mapID, $nodeName, null, null, $nodeFromID, $nodeX, $nodeY]);
    }
    return $id;
}

function genNodeFsName($type, $id) {
    require_once(CLASS_ROOT . "/mysql_query.php");
    $query = new Mysql_query();
    $queryStr = "";
    if ($type === "static") {
        $queryStr = "SELECT CONCAT('static-', name) AS fsName FROM books WHERE ID = ?";
    } else if ($type === "variable") {
        $queryStr = "SELECT CONCAT('variable-', srs.name, '-', cld.childName) AS fsName FROM children cld LEFT JOIN series srs ON cld.seriesName = srs.name WHERE child_id = ?";
    } else if ($type === "unit") {
        $queryStr = "SELECT CONCAT('unit-', sch.name, '-', sub.name, '-', lvl.name, '-', unt.name) AS fsName FROM units unt LEFT JOIN levels lvl ON unt.levelID = lvl.ID LEFT JOIN subjects sub ON unt.subjectID = sub.ID LEFT JOIN schools sch ON unt.schoolID = sch.ID WHERE unt.ID = ?";
    }
    $fsName = $query->fetchSingle($queryStr, ["s", $id]);
    return $fsName;
}
function getFileInPathString($pathStr) {
    $a = explode("/", $pathStr);
    $file = array_pop($a);
    return $file;
}
