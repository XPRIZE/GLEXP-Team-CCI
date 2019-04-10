<?php
require_once("../../config.php");

$oldName = isset($_GET['oldName']) ? $_GET['oldName'] : false;
$newName = isset($_GET['newName']) ? $_GET['newName'] : false;
$schoolName = $_GET['schoolName'];
$subjectName = isset($_GET['subjectName']) ? $_GET['subjectName'] : false;
$levelName = isset($_GET['levelName']) ? $_GET['levelName'] : false;
$isTutorial = isset($_GET['isTutorial']) ? $_GET['isTutorial'] : false;

if (!$oldName && !$newName) {
    echo "error: no newName or oldName";
} else {
    chdir("../");
    include_once("../../includes/dbConnect.php");
    $con = new dbConnect();

    include('../php/checkSchoolNames.php');
    $ret = checkNameTaken($schoolName, $subjectName, $levelName, $oldName);
    $schoolID = $ret['school'];
    $subjectID = isset($ret['subject']) ? $ret['subject'] : false;
    $levelID = isset($ret['level']) ? $ret['level'] : false;

    $sql = $con->mysqli;
    if ($isTutorial) {
	$sqlObj = $sql->prepare("UPDATE units SET `name` = ? WHERE `name` = ? AND schoolID = ?");
	$sqlObj->bind_param('ssi', $newName, $oldName, $schoolID);
	$oldLoc = "../schools/$schoolName/tutorials/$oldName";
	$newLoc = "../schools/$schoolName/tutorials/$newName";
    } else {
	$sqlObj = $sql->prepare("UPDATE units SET `name` = ? WHERE `name` = ? AND schoolID = ? AND subjectID = ? AND levelID = ?");
	$sqlObj->bind_param('ssiii', $newName, $oldName, $schoolID, $subjectID, $levelID);
	$oldLoc = "../schools/$schoolName/$subjectName/$levelName/$oldName";
	$newLoc = "../schools/$schoolName/$subjectName/$levelName/$newName";
    }
    $sqlObj->execute();

    rename($oldLoc, $newLoc);

    include("../php/saveXML.php");
    // Update name in unit / tutorial XML
    $xml = simplexml_load_file("$newLoc/MainXML.xml");
    $xml->Info->PrjName = $newName;
    $xml->Info->PrjNameLong = $newName;
    saveXML($xml, "$newLoc/MainXML.xml");
    $xml = false;

    // I don't think we save XML just yet... that's done in the prep right?
    /*
      // update name in school house xml
      if (is_file("../schools/$schoolName/deploy.php")) {
      echo "Yup, it's a file";
      } else {
      echo $asdf;
      }
      $xml = simplexml_load_file("../schools/$schoolName/school.xml");
      if ($isTutorial) {
      foreach ($xml->tutorials->children() as $tutorial) {
      if ($tutorial->name == $oldName) {
      $tutorial->name = $newName;
      }
      }
      } else {
      foreach ($xml->subjects->children() as $subject) {
      if ($subject->name == $subjectName) {
      foreach ($subject->levels->children() as $level) {
      if ($level->name == $levelName) {
      foreach ($level->units->children() as $unit) {
      if ($unit->name == $oldName) {
      $unit->name = $newName;
      }
      }
      }
      }
      }
      }
      }

      saveXML($xml, "../schools/$schoolName/school.xml");
     */

    echo "done";
}
?>