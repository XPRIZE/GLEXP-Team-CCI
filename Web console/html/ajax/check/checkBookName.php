<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 8/24/2016
 * Time: 2:23 PM
 */

chdir('../');
include('../../includes/dbConnect.php');
$requestedName = $_GET["name"];
if (is_dir("../books/$requestedName")) {
    echo "1"; // exists in file system, don't bother checking the db, file system is faster (maybe?)
}   else    {
    $con = new DBConnect();
    $sql = $con->mysqli;
    $sqlObj = $sql->prepare("SELECT ID FROM books WHERE `name` = ? LIMIT 1");
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