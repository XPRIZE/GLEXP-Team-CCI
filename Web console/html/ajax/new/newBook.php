<?php
/**
 
 * User: Jason
 * Date: 6/16/2016
 * Time: 4:48 PM
 */

chdir('../');
include('../../includes/dbConnect.php');
$requestedName = $_GET["name"];
$con = new DBConnect();
$sql = $con->mysqli;
$sqlObj = $sql->prepare("INSERT INTO books (`name`, longname) VALUES (?, ?)");
$sqlObj->bind_param('ss', $requestedName, $requestedName);
$sqlObj->execute();
$sqlPass = true;

$sqlObj = false;
$sqlObj = $sql->prepare("SELECT ID FROM books WHERE 1 ORDER BY ID DESC LIMIT 1");
$sqlObj->execute();
$result = $sqlObj->get_result();
$last = $result->fetch_assoc();
$id = $last['ID'];


if ($sqlPass) {
    mkdir("../books/$id");
    mkdir("../books/$id/previousVersions");
    file_put_contents("../books/$id/index.php", file_get_contents("../php/templates/bookIndex.php"));
    echo true;
} else {
    echo false;
}


?>