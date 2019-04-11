<?php
require_once("../../config.php");

chdir('../');

// Can be optional because tutorials don't have to have subjects
$subjectName = isset($_GET['subjectName']) ? $_GET['subjectName'] : false;

$schoolName = $_GET['schoolName'];
$tutorialName = $_GET['tutorialName'];

include_once("../../includes/loginCheck.php");
if (loginCheck()) {
    include('../php/checkSchoolNames.php');
    $ret = checkNameTaken($schoolName, $subjectName, false, $tutorialName);
    if (isset($ret["school"])) {
	$schoolID = $ret["school"];
	$subjectID = isset($ret["subject"]) ? $ret["subject"] : false;
	$con = new dbConnect();
	$sql = $con->mysqli;
	$sqlObj = false;
	$tutLoc = "schools/$schoolName/tutorials/$tutorialName";
	if ($subjectID) {
	    $query = "DELETE FROM units WHERE schoolID = ? AND subjectID = ? AND name = ?";
	    $sqlObj = $sql->prepare($query);
	    $sqlObj->bind_param('sss', $schoolID, $subjectID, $tutorialName);
	} else {
	    $query = "DELETE FROM units WHERE schoolID = ? AND name = ?";
	    $sqlObj = $sql->prepare($query);
	    $sqlObj->bind_param('ss', $schoolID, $tutorialName);
	}
	$sqlObj->execute();

	include('../php/rrmdir.php');
	$ret = rrmdir($tutLoc);
	if ($ret) {
	    echo "done";
	} else {
	    echo "error with rrmdir cmd";
	}
    } else {
	echo "error: School does not exist";
    }
}
?>