<?php
require_once("../../config.php");

$oldName = isset($_GET['oldName']) ? $_GET['oldName'] : false;
$newName = isset($_GET['newName']) ? $_GET['newName'] : false;
$schoolName = $_GET['schoolName'];
$subjectName = $_GET['subjectName'];

if (!$oldName && !$newName) {
    echo "error: no newName or oldName";
} else {
    chdir("../");
    include_once("../../includes/dbConnect.php");
    $con = new dbConnect();

    include('../php/checkSchoolNames.php');
    $ret = checkNameTaken($schoolName, $subjectName, false, false);
    $schoolID = $ret['school'];
    $subjectID = $ret['subject'];

    $sql = $con->mysqli;
    $sqlObj = $sql->prepare("UPDATE levels SET `name` = ? WHERE `name` = ? AND schoolID = ? AND subjectID = ?");
    $sqlObj->bind_param('ssii', $newName, $oldName, $schoolID, $subjectID);
    $sqlObj->execute();
    rename("../schools/$schoolName/$subjectName/$oldName", "../schools/$schoolName/$subjectName/$newName");

    include("../php/saveXML.php");
    $xml = simplexml_load_file("../schools/$schoolName/school.xml");
    foreach ($xml->subjects->children() as $subject) {
	if ($subject->name == $subjectName) {
	    foreach ($subject->levels->children() as $level) {
		if ($level->name == $oldName) {
		    $level->name = $newName;
		}
	    }
	}
    }
    saveXML($xml, "../schools/$schoolName/school.xml");

    echo "done";
}
?>