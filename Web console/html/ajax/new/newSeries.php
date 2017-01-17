<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 6/16/2016
 * Time: 4:48 PM
 */

chdir('../');
include('../../includes/dbConnect.php');
$requestedName = $_GET["name"];
$con = new DBConnect();
$sql = $con->mysqli;
$sqlObj = $sql->prepare("INSERT INTO series (name) VALUES (?)");
if ($sqlObj) {
    $sqlObj->bind_param('s', $requestedName);
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