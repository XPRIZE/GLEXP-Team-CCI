<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// setTutorialType.php?tutorialID=110&type=sub&schoolID=11&subjectID=9 <-- makes 110 the *only* sub 9 tut of school
// setTutorialType.php?tutorialID=110&type=app&schoolID=11 <-- makes 110 the *only* app tut of school
// setTutorialType.php?tutorialID=110&type=float <-- makes 110 a float, does not effect other tuts

chdir('../');
include_once("../../includes/dbConnect.php");
require('../../includes/loginCheck.php');
include('../php/checkSchoolNames.php');

$tutorialName = $_GET['tutorialName'];
$subjectName = isset($_GET['subjectName']) ? $_GET['subjectName'] : false;
$schoolName = $_GET['schoolName'];
$type = $_GET['type'];

if ($ret = loginCheck() === true) {
    $float = "float";
    $null = null;

    $con = new dbConnect();
    $sql = $con->mysqli;
    if ($type == "app") {
	if ($schoolName) {
	    $ret = checkNameTaken($schoolName, false, false, false);
	    if (isset($ret["school"])) {
		// Clear all app tutorials with similar schoolID
		$schoolID = $ret['school'];
		$sqlObj = $sql->prepare("UPDATE units SET tutorialType = ? WHERE schoolID = ?");
		$sqlObj->bind_param('si', $float, $schoolID);
		$sqlObj->execute();

		$sqlObj = false;
		$sqlObj = $sql->prepare("UPDATE units SET tutorialType = ? WHERE `name` = ? AND schoolID = ?");
		$sqlObj->bind_param('ssi', $type, $tutorialName, $schoolID);
		$sqlObj->execute();
	    } else {
		echo "Error: School not found";
	    }
	} else {
	    echo "Error: Cannot clear app tutorial because schoolID not provided";
	}
    } else if ($type !== "float") {
	if ($subjectName) {
	    $ret = checkNameTaken($schoolName, $subjectName, false, false);
	    if (isset($ret["school"]) && isset($ret["subject"])) {
		// This clears out the subID from some of the untis for some reason, so fuck
		/*
		  $true = true;
		  // Clear all subject tutorials with similar schoolID and subjectID
		  $schoolID = $ret['school'];
		  $subjectID = $ret['subject'];
		  $sqlObj = $sql->prepare("UPDATE units SET tutorialType = ?, subjectID = ? WHERE schoolID = ? AND subjectID = ? AND `isTutorial` = ?");
		  $sqlObj->bind_param('ssiib', $float, $null, $schoolID, $subjectID, $true);
		  $sqlObj->execute();
		 *
		 */
		  $schoolID = $ret['school'];
		  $subjectID = $ret['subject'];

		// Set new
		$sqlObj = false;
		$sqlObj = $sql->prepare("UPDATE units SET tutorialType = ?, subjectID = ? WHERE `name` = ? AND schoolID = ?");
		$sqlObj->bind_param('sisi', $type, $subjectID, $tutorialName, $schoolID);
		$sqlObj->execute();
	    } else {
		echo "Error: School not found";
	    }
	} else {
	    echo "Error: Cannot clear subject tutorial because schoolID and subjectID not provided";
	}
    } else {
	if ($schoolName) {
	    $ret = checkNameTaken($schoolName, false, false, false);
	    if (isset($ret["school"])) {
		// Is float, no need to clear anything.
		$schoolID = $ret['school'];
		$sqlObj = false;
		$sqlObj = $sql->prepare("UPDATE units SET tutorialType = ? WHERE `name` = ? AND schoolID = ?");
		$sqlObj->bind_param('ssi', $type, $tutorialName, $schoolID);
		$sqlObj->execute();
	    } else {
		echo "Error: School not found";
	    }
	} else {
	    echo "Error: Cannot set tutorial because schoolName not provided";
	}
    }

    echo "done";
}