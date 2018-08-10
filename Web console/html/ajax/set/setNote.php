<?php
/**
 
 * User: Jason
 * Date: 6/25/2016
 * Time: 3:18 PM
 */

chdir('../');
$series = $_GET['series'];
$child = $_GET['child'];
$page = $_GET['page'];
$assetSrc = $_GET['assetSrc'];
$type = $_GET['type'];
$val = $_GET['val'];

include_once('../../includes/dbConnect.php');
$con = new DBConnect();
$sql = $con->mysqli;

// Delete prev note
$sqlObj = $sql->prepare("DELETE FROM childassetnotes WHERE refSeries = ? AND refBook = ? AND refPage = ? AND noteType = ? AND originalAssetName = ?");
if ($sqlObj) {
    $sqlObj->bind_param('sssss', $series, $child, $page, $type, $assetSrc);
    $sqlObj->execute();
} else {
    echo "error: bad sql obj 26";
}

// Insert new note
$sqlObj = $sql->prepare("INSERT INTO childassetnotes (refSeries, refBook, refPage, noteType, originalAssetName, noteAct) VALUES (?, ?, ?, ?, ?, ?)");
if ($sqlObj) {
    $sqlObj->bind_param('ssssss', $series, $child, $page, $type, $assetSrc, $val);
    $sqlObj->execute();
} else {
    echo "error: bad sql obj";
}
$elemID = "book_" . $child . "_page_" . $page . "_src_" . $assetSrc . "_" . $type;
echo $elemID;

?>