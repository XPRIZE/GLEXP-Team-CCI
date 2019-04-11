<?php
require_once("../../config.php");


chdir('../');
include('../../includes/dbConnect.php');
$requestedName = $_GET["name"];
$con = new DBConnect();
$sql = $con->mysqli;
$sqlObj = $sql->prepare("INSERT INTO curriculum (name) VALUES (?)");
if ($sqlObj) {
    $sqlObj->bind_param('s', $requestedName);
    $sqlObj->execute();
    $sqlPass = true;
} else {
    echo "error: bad sql obj";
}

if ($sqlPass) {
    mkdir("../curriculum/$requestedName");
    file_put_contents("../curriculum/$requestedName/edit.php", '<?php $GLOBALS["seriesName"] = "' . $requestedName . '"; require("../../php/curriculumEdit.php"); ?>');
    mkdir("../curriculum/$requestedName/previousVersions");
    mkdir("../curriculum/$requestedName/deletedChildren");
    echo true;
} else {
    echo false;
}


?>