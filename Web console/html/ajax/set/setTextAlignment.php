<?php

require_once("../../config.php");

chdir('../');
$series = $_GET['series'];
$child = $_GET['child'];
$page = $_GET['page'];
$assetSrc = $_GET['assetSrc'];
$val = $_GET['val'];

include_once('../../includes/dbConnect.php');
$con = new DBConnect();
$sql = $con->mysqli;

// Insert new note
// UPDATE swaps SET refBook = ? WHERE refBook = ?
$sqlObj = $sql->prepare("UPDATE swaps SET sizeOrLoc = ? WHERE `refSeries` = ? AND refBook = ? AND originalAssetName = ?");
if ($sqlObj) {
    $sqlObj->bind_param('ssss', $val, $series, $child, $assetSrc);
    $sqlObj->execute();
} else {
    echo "error: bad sql obj";
}

$xml = simplexml_load_file("../series/$series/$child.xml");
foreach ($xml->Pages->children() as $page) {
    foreach ($page->Objects->children() as $object) {
        if ((string) $object->ObjName == $assetSrc) {
            $object->TextAlign = $val;
        }
    }
}
saveXML($xml, "../series/$series/$child.xml");

function deleteBlankLines($loc) {
    $str = file_get_contents($loc);
    $str = preg_replace("/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n]+/", "\n", $str);
    file_put_contents($loc, $str);
}

function saveXML($node, $name) {
    deleteBlankLines($name);
    // Pretty print the xml.
    $domxml = new DOMDocument('1.0');
    $domxml->preserveWhiteSpace = false;
    $domxml->formatOutput = true;
    $domxml->loadXML($node->asXML());
    $domxml->save($name);
}

$elemID = "book_" . $child . "_page_" . $page . "_src_" . $assetSrc . "_" . $type;
echo $elemID;
?>