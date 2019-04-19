<?php

/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 8/18/2016
 * Time: 3:46 PM
 */
function checkNameTaken($school, $subject, $level, $unit) {
    if (!class_exists("DBConnect")) {
	include_once('../../includes/dbConnect.php');
    }

    $con = new DBConnect();
    $sql = $con->mysqli;

    $ret = [];

    if ($school) {
	$schoolID = false;
	$sqlObj = $sql->prepare("SELECT ID FROM schools WHERE name = ? LIMIT 1");
	$sqlObj->bind_param('s', $school);
	$sqlObj->execute();
	$sqlObj->bind_result($schoolID);
	$sqlObj->fetch();
	if ($schoolID) {
	    $ret["school"] = $schoolID;
	}
	$sqlObj = false;
    }
    if ($subject) {
	$subjectID = false;
	$sqlObj = $sql->prepare("SELECT ID FROM subjects WHERE name = ? AND schoolID = ? LIMIT 1");
	$sqlObj->bind_param('ss', $subject, $schoolID);
	$sqlObj->execute();
	$sqlObj->bind_result($subjectID);
	$sqlObj->fetch();
	if ($subjectID) {
	    $ret["subject"] = $subjectID;
	};
	$sqlObj = false;
    }
    if ($level) {
	$levelID = false;
	$sqlObj = $sql->prepare("SELECT ID FROM levels WHERE name = ? AND subjectID = ? AND schoolID = ? LIMIT 1");
	$sqlObj->bind_param('sss', $level, $subjectID, $schoolID);
	$sqlObj->execute();
	$sqlObj->bind_result($levelID);
	$sqlObj->fetch();
	if ($levelID) {
	    $ret["level"] = $levelID;
	}
	$sqlObj = false;
    }
    if ($unit) {
	$unitID = false;
	if ($level == "") { // Tutorial
	    $isTutorial = true;
	    $sqlObj = $sql->prepare("SELECT ID FROM units WHERE name = ? AND schoolID = ? AND isTutorial = ? LIMIT 1");
	    $sqlObj->bind_param('ssi', $unit, $schoolID, $isTutorial);
	} else { // reg unit
	    $sqlObj = $sql->prepare("SELECT ID FROM units WHERE name = ? AND levelID = ? AND subjectID = ? AND schoolID = ? LIMIT 1");
	    $sqlObj->bind_param('ssss', $unit, $levelID, $subjectID, $schoolID);
	}
	$sqlObj->execute();
	$sqlObj->bind_result($unitID);
	$sqlObj->fetch();
	if ($unitID) {
	    $ret["unit"] = $unitID;
	}
	$sqlObj = false;
    }
    return $ret;
}

?>