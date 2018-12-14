<?php
require_once("../../config.php");

chdir('../');
$id = $_GET['bookID'];
$folderName = $_GET['folderName'];

include_once("../../includes/loginCheck.php");
if (loginCheck()) {
    $con = new DBConnect();
    $sql = $con->mysqli;
    $sqlObj = $sql->prepare("UPDATE books SET `folder` = ? WHERE ID = ?");
    $sqlObj->bind_param('ss', $folderName, $id);
    $sqlObj->execute();
    echo "done";
}
?>