<?php
require_once("../../config.php");
chdir('../');
require('../../includes/loginCheck.php');
require('../php/setSchoolXML.php');
$school = $_GET['school'];
$tutorial = $_GET['tutorial'];

$username = false;
if ($ret = loginCheck() === true) {
    $file = isset($_FILES['upload']) ? $_FILES['upload'] : false;
    if ($file) {
	$fileLoc = $file['tmp_name'];
	$fileName = $file['name'];
	$newLoc = "../schools/$school/tutorials/$tutorial/icons";
	if (!is_dir($newLoc)) {
	    mkdir($newLoc);
	}
	$newLoc = $newLoc . "/icon.png";
	rename($fileLoc, $newLoc);
	setTutorialIcon($school, $fileName);
	echo '{"status":"server","src":"/icons/' . $fileName . '"}';
    } else {
	echo '{"status":"error","message":"No file"}';
    }
} else {
    echo '{"status":"error","message":"Bad login"}';
}