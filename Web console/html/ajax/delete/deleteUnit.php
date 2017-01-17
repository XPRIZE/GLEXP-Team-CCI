<?php

/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 8/17/2016
 * Time: 11:15 AM
 */
chdir('../');
$schoolName = $_GET['schoolName'];
$subjectName = $_GET['subjectName'];
$levelName = $_GET['levelName'];
$unitName = $_GET['unitName'];

include_once("../../includes/loginCheck.php");
if (loginCheck()) {
    include('../php/checkSchoolNames.php');
    $ret = checkNameTaken($schoolName, $subjectName, $levelName, $unitName);
    if ((isset($ret["school"]) && isset($ret["subject"]) && isset($ret["level"]) && isset($ret["unit"])) ||
	    (isset($ret["school"]) && isset($ret["subject"]) && $unitName == "Tutorial")
    ) {
	$schoolID = $ret["school"];
	$subjectID = $ret["subject"];
	$levelID = $ret["level"];
	$con = new dbConnect();
	$sql = $con->mysqli;
	$sqlObj = false;
	$unitLoc = "schools/$schoolName/$subjectName/$levelName/$unitName";
	$query = "DELETE FROM units WHERE schoolID = ? AND subjectID = ? AND levelID = ? AND name = ?";
	$sqlObj = $sql->prepare($query);
	$sqlObj->bind_param('ssss', $schoolID, $subjectID, $levelID, $unitName);
	$sqlObj->execute();

	include('../php/rrmdir.php');
	$ret = rrmdir($unitLoc);
	if ($ret) {
	    echo "done";
	} else {
	    echo "error with rrmdir cmd";
	}
    } else {
	echo "error: School, Subject, Level or Unit does not exist";
    }
}
?>