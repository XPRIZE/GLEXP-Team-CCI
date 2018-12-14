<?php
require_once("../../config.php");

$unit = $_GET['unitName'];
$school = $_GET['schoolName'];
$pageSet = $_GET['pageObj'];
$pageSet = json_decode($pageSet);

$subject = isset($_GET['subjectName']) ? $_GET['subjectName'] : false;
$level = isset($_GET['levelName']) ? $_GET['levelName'] : false;
$isTutorial = isset($_GET['isTutorial']) ? $_GET['isTutorial'] : false;

chdir('../');

include('../php/checkSchoolNames.php');
$schoolIDs = checkNameTaken($school, $subject, $level, $unit);

include_once('../../includes/dbConnect.php');
$con = new DBConnect();
$sql = $con->mysqli;

// Delete any previous order
$sqlObj = $sql->prepare("DELETE FROM unitPages WHERE unitID = ?");
$sqlObj->bind_param('s', $schoolIDs['unit']);
$sqlObj->execute();

for ($p = 0; $p < count($pageSet); $p++) {
    $cur = $pageSet[$p];
    $sqlObj = false;
    $unitPageNum = $p + 1;
    if ($cur->type == "Child") {
	$sqlObj = $sql->prepare("INSERT INTO unitPages (unitID, unitPage, refPage, refSeries, refChild) VALUES (?, ?, ?, ?, ?)");
	$sqlObj->bind_param('sssss', $schoolIDs['unit'], $unitPageNum, $cur->page, $cur->seriesName, $cur->name);
	$sqlObj->execute();
    } else {
	$sqlObj = $sql->prepare("INSERT INTO unitPages (unitID, unitPage, refPage, refBook) VALUES (?, ?, ?, ?)");
	$sqlObj->bind_param('ssss', $schoolIDs['unit'], $unitPageNum, $cur->page, $cur->name);
	$sqlObj->execute();
    }
}

echo $schoolIDs['unit'];

// TODO: Splice together the xml
?>