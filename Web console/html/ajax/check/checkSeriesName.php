<?php
/**
 
 * User: Jason
 * Date: 6/16/2016
 * Time: 4:48 PM
 */

chdir('../');
include('../../includes/dbConnect.php');
$requestedName = $_GET["name"];
if (is_dir("../series/$requestedName")) {
    echo "1"; // exists in file system, don't bother checking the db, file system is faster (maybe?)
}   else    {
    $con = new DBConnect();
    $sql = $con->mysqli;
    $sqlObj = $sql->prepare("SELECT ID FROM series WHERE name = ? AND deleted = 0 LIMIT 1");
    if ($sqlObj) {
        $sqlObj->bind_param('s', $requestedName);
        $sqlObj->execute();
        $ID = false;
        $sqlObj->bind_result($ID);
        $sqlObj->fetch();
        echo $ID;
    }   else    {
        echo "error: Bad sql object";
    }
}


?>