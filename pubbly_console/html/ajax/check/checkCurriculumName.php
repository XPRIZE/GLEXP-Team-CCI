<?php
require_once("../../config.php");

chdir('../');
include('../../includes/dbConnect.php');
$requestedName = $_GET["name"];
if (is_dir("../curriculum/$requestedName")) {
    echo "1"; // exists in file system, don't bother checking the db, file system is faster (maybe?)
} else {
    $con = new DBConnect();
    $sql = $con->mysqli;
    $sqlObj = $sql->prepare("SELECT ID FROM curriculum WHERE name = ? LIMIT 1");
    if ($sqlObj) {
        $sqlObj->bind_param('s', $requestedName);
        $sqlObj->execute();
        $ID = false;
        $sqlObj->bind_result($ID);
        $sqlObj->fetch();
        echo $ID;
    } else {
        echo "error: Bad sql object";
    }
}


?>