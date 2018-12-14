<?php
require_once("../../config.php");

$oldName = isset($_GET['oldName']) ? $_GET['oldName'] : false;
$newName = isset($_GET['newName']) ? $_GET['newName'] : false;
$schoolName = $_GET['schoolName'];

if (!$oldName && !$newName) {
    echo "error: no newName or oldName";
} else {
    chdir("../");
    include_once("../../includes/dbConnect.php");
    $con = new dbConnect();

    include('../php/checkSchoolNames.php');
    $ret = checkNameTaken($schoolName, false, false, false);
    $schoolID = $ret['school'];

    $sql = $con->mysqli;
    $sqlObj = $sql->prepare("UPDATE subjects SET `name` = ? WHERE `name` = ? AND schoolID = ?");
    $sqlObj->bind_param('ssi', $newName, $oldName, $schoolID);
    $sqlObj->execute();
    rename("../schools/$schoolName/$oldName", "../schools/$schoolName/$newName");

    include("../php/saveXML.php");
    $xml = simplexml_load_file("../schools/$schoolName/school.xml");
    foreach ($xml->subjects->children() as $subject) {
	if ($subject->name == $oldName) {
	    $subject->name = $newName;
	}
    }
    saveXML($xml, "../schools/$schoolName/school.xml");

    echo "done";
}
?>