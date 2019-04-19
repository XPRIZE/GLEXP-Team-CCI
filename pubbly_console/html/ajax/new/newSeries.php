<?php
require_once("../../config.php");


chdir('../');
include('../../includes/dbConnect.php');
$requestedName = $_GET["name"];
$requestedFolder = $_GET["folder"];
$con = new DBConnect();
$sql = $con->mysqli;
$sqlObj = $sql->prepare("INSERT INTO series (name, folder) VALUES (?, ?)");
if ($sqlObj) {
    $sqlObj->bind_param('ss', $requestedName, $requestedFolder);
    $sqlObj->execute();
    $sqlPass = true;
}   else    {
    echo "error: bad sql obj";
}

if ($sqlPass) {
    mkdir("../series/$requestedName");
    file_put_contents("../series/$requestedName/edit.php",'<?php $GLOBALS["seriesName"] = "' . $requestedName . '"; require("../../php/seriesEdit.php"); ?>');
    mkdir("../series/$requestedName/previousVersions");
    mkdir("../series/$requestedName/deletedChildren");
    echo true;
}   else    {
    echo false;
}



?>