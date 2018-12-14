<?php
require_once("../../config.php");


chdir('../');
include('../../includes/dbConnect.php');
$schoolName = $_GET["schoolName"];
$subjectName = $_GET["subjectName"];
$levelName = $_GET["levelName"];
$con = new DBConnect();
$sql = $con->mysqli;

include('../php/checkSchoolNames.php');
$ret = checkNameTaken($schoolName, $subjectName, $levelName, false);
if (isset($ret["level"])) {
    echo "error: Level name taken";
}   else    {
    $schoolID = $ret["school"];
    $subjectID = $ret["subject"];
    $sqlObj = $sql->prepare("INSERT INTO levels (schoolID, subjectID, name) VALUES (?, ?, ?)");
    $sqlObj->bind_param('sss', $schoolID, $subjectID, $levelName);
    $sqlObj->execute();

    mkdir("../schools/$schoolName/$subjectName/$levelName");
    echo "done";
}



?>