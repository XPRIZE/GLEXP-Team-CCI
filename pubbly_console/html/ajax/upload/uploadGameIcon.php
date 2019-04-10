<?php
require_once("../../config.php");

$file = isset($_FILES['upload']) ? $_FILES['upload'] : false;
$schoolName = $_GET['schoolName'];
$subjectName = $_GET['subjectName'];
$levelName = $_GET['levelName'];
$unitName = $_GET['unitName'];

chdir("../");
include_once("../../includes/dbConnect.php");
$con = new dbConnect();

include('../php/checkSchoolNames.php');
$ret = checkNameTaken($schoolName, $subjectName, $levelName, $unitName);

if ($file && $ret['school'] && $ret['subject'] && $ret['level'] && $ret['unit']) {
    // if ($file['type'] == "image/png" || $file['type'] == "image/jpeg") {
    if ($file['type'] == "image/png") {
	$tmpLoc = $file['tmp_name'];
	$ext = explode("/", $file['type'])[1];
	$gameNum = explode(" ", $unitName)[1];
	$gameBase = "../schools/$schoolName/$subjectName/icons/Level_" . $levelName . "_Game_" . $gameNum;
	if (!is_dir("../schools/$schoolName/$subjectName/icons/")) {
	    mkdir("../schools/$schoolName/$subjectName/icons/");
	}
	if (is_file("$gameBase.png")) {
	    unlink("$gameBase.png");
	}
	if (is_file("$gameBase.jpeg")) {
	    unlink("$gameBase.jpeg");
	}
	move_uploaded_file($tmpLoc, "$gameBase.$ext");
	echo '{"status":"server"}';
    } else {
	echo '{"status":"error"}';
	// echo "error: Only accept pngs";
    }
} else {
    echo '{"status":"error"}';
    //echo "error: Missing info or file";
}
?>