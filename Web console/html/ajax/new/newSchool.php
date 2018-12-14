<?php
require_once("../../config.php");


chdir('../');
include('../../includes/dbConnect.php');
$requestedName = $_GET["schoolName"];
$con = new DBConnect();
$sql = $con->mysqli;

include('../php/checkSchoolNames.php');
$ret = checkNameTaken($requestedName, false, false, false);
if (isset($ret["school"])) {
    echo "error: School name taken";
}   else    {
    $sqlObj = $sql->prepare("INSERT INTO schools (name) VALUES (?)");
    $sqlObj->bind_param('s', $requestedName);
    $sqlObj->execute();
    $sqlPass = true;

    mkdir("../schools/$requestedName");
    echo "done";
}



?>