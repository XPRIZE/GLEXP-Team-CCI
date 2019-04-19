<?php
require_once("../../config.php");

$oldName = isset($_GET['oldName']) ? $_GET['oldName'] : false;
$newName = isset($_GET['newName']) ? $_GET['newName'] : false;

if (!$oldName && !$newName) {
    echo "error: no newName or oldName";
} else {
    chdir("../");
    include_once("../../includes/dbConnect.php");
    $con = new dbConnect();
    $sql = $con->mysqli;
    $sqlObj = $sql->prepare("UPDATE schools SET `name` = ? WHERE `name` = ?");
    $sqlObj->bind_param('ss', $newName, $oldName);
    $sqlObj->execute();
    rename("../schools/$oldName", "../schools/$newName");
    if (is_dir("../program/$oldName")) {
        rename("../program/$oldName", "../program/$newName");
    }

    /*
      include("../php/saveXML.php");
      $xml = simplexml_load_file("../schools/$newName/school.xml");
      $xml->name = $newName;
      saveXML($xml, "../schools/$newName/school.xml");
     */
    echo "done";
}
?>