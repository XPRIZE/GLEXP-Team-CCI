<?php

/**
 
 * User: Jason
 * Date: 8/20/2016
 * Time: 2:31 PM
 */
chdir('../');
$schoolName = isset($_GET["schoolName"]) ? $_GET["schoolName"] : false;
$subjectName = isset($_GET["subjectName"]) ? $_GET["subjectName"] : false;
$levelName = isset($_GET["levelName"]) ? $_GET["levelName"] : false;
$newOrder = [];
$isTutorial = isset($_GET["isTutorial"]) ? $_GET["isTutorial"] : false;

$i = 0;
foreach ($_POST as $unit) {
    $i++;
    $newOrder[$i] = $unit;
}
if ($newOrder) {
    include('../../includes/dbConnect.php');
    include('../php/checkSchoolNames.php');
    $ret = checkNameTaken($schoolName, $subjectName, $levelName, false);
    if (isset($ret["school"]) && isset($ret["subject"]) && isset($ret["level"])) {
	$schoolID = $ret["school"];
	$subjectID = $ret["subject"];
	$levelID = $ret["level"];
	$ret = [];
	$con = new DBConnect();
	$sql = $con->mysqli;
	for ($i = 1; $i < count($newOrder) + 1; $i++) {
	    $name = $newOrder[$i];
	    $sqlObj = $sql->prepare("UPDATE units SET `order` = ? WHERE schoolID = ? AND subjectID = ? AND levelID = ? AND `name` = ?");
	    $sqlObj->bind_param('sssss', $i, $schoolID, $subjectID, $levelID, $name);
	    $sqlObj->execute();
	}
	echo "done";
    } else if ($isTutorial && $ret["school"]) {
	$schoolID = $ret["school"];
	$ret = [];
	$con = new DBConnect();
	$sql = $con->mysqli;
	for ($i = 1; $i < count($newOrder) + 1; $i++) {
	    $true = 1;
	    $name = $newOrder[$i];
	    $sqlObj = $sql->prepare("UPDATE `units` SET `order` = ? WHERE `schoolID` = ? AND `name` = ? AND `isTutorial` = ?");
	    $sqlObj->bind_param('iisi', $i, $schoolID, $name, $true);
	    $sqlObj->execute();
	}
	echo "done";
    } else {
	echo "error: Can't find unit, maybe the school, subject or level are bad.";
    }
} else {
    echo "error: missing newOrder";
}
?>