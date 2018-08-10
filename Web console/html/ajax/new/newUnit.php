<?php

/**
 
 * User: Jason
 * Date: 8/19/2016
 * Time: 10:15 AM
 */
chdir('../');
include('../../includes/dbConnect.php');
$schoolName = $_GET["schoolName"];
$subjectName = isset($_GET["subjectName"]) ? $_GET["subjectName"] : false;
$levelName = isset($_GET["levelName"]) ? $_GET["levelName"] : false;
$unitName = $_GET["unitName"];
$isGame = isset($_GET['isGame']) ? $_GET['isGame'] : 0;
$isTutorial = isset($_GET['isTutorial']) ? $_GET['isTutorial'] : 0;

$con = new DBConnect();
$sql = $con->mysqli;

include('../php/checkSchoolNames.php');
$ret = checkNameTaken($schoolName, $subjectName, $levelName, $unitName);
if (isset($ret["unit"])) {
    echo "error: Name taken";
} else {
    $schoolID = $ret["school"];
    $subjectID = isset($ret["subject"]) ? $ret["subject"] : null;
    $levelID = isset($ret["level"]) ? $ret["level"] : null;




    if ($isTutorial) {
	$nextInOrder = false;
	$sqlObj = $sql->prepare("SELECT `order` FROM units WHERE schoolID = ? AND isTutorial = ? ORDER BY `order` DESC");
	$sqlObj->bind_param('ii', $schoolID, $isTutorial);
	$sqlObj->execute();
	$sqlObj->store_result();
	$nextInOrder = $sqlObj->num_rows;
	$nextInOrder++;

	$sqlObj = false;
	$tutType = "float";
	$sqlObj = $sql->prepare("INSERT INTO units (schoolID, subjectID, levelID, `name`, `order`, `isGame`, `isTutorial`, `tutorialType`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
	$sqlObj->bind_param('sssssiis', $schoolID, $subjectID, $levelID, $unitName, $nextInOrder, $isGame, $isTutorial, $tutType);
	$sqlObj->execute();
	$unitLoc = "../schools/$schoolName/tutorials/$unitName";
	$unitIndex = file_get_contents("../php/templates/tutorialIndex.php");
    } else {
	$nextInOrder = false;
	$sqlObj = $sql->prepare("SELECT `order` FROM units WHERE schoolID = ? AND subjectID = ? AND levelID = ? ORDER BY `order`");
	$sqlObj->bind_param('sss', $schoolID, $subjectID, $levelID);
	$sqlObj->execute();
	$sqlObj->store_result();
	$nextInOrder = $sqlObj->num_rows;
	$nextInOrder++;

	$sqlObj = false;
	$sqlObj = $sql->prepare("INSERT INTO units (schoolID, subjectID, levelID, `name`, `order`, `isGame`, `isTutorial`) VALUES (?, ?, ?, ?, ?, ?, ?)");
	$sqlObj->bind_param('sssssii', $schoolID, $subjectID, $levelID, $unitName, $nextInOrder, $isGame, $isTutorial);
	$sqlObj->execute();
	$unitLoc = "../schools/$schoolName/$subjectName/$levelName/$unitName";
	$unitIndex = file_get_contents("../php/templates/unitIndex.php");
    }
    if (!is_dir("../schools/$schoolName/tutorials")) {
	mkdir("../schools/$schoolName/tutorials");
    }
    mkdir($unitLoc);
    mkdir("$unitLoc/audio");
    mkdir("$unitLoc/images");
    mkdir("$unitLoc/video");

    $unitXML = file_get_contents("../php/templates/unitXML.xml");
    file_put_contents("$unitLoc/index.php", $unitIndex);
    file_put_contents("$unitLoc/MainXML.xml", $unitXML);

    include("../php/saveXML.php");

    $xml = simplexml_load_file("$unitLoc/MainXML.xml");
    $xml->Info->PrjName = $unitName;
    $xml->Info->PrjNameLong = $unitName;
    saveXML($xml, "$unitLoc/MainXML.xml");

    echo "done";
}
?>