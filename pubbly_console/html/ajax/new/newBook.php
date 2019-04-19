<?php
require_once("../../config.php");

chdir('../');
include('../../includes/dbConnect.php');
$requestedName = $_GET["name"];
$requestedFolder = $_GET["folder"];
$con = new DBConnect();
$sql = $con->mysqli;
$sqlObj = $sql->prepare("INSERT INTO books (`name`, longname, `folder`) VALUES (?, ?, ?)");
$sqlObj->bind_param('sss', $requestedName, $requestedName, $requestedFolder);
$sqlObj->execute();
$sqlPass = true;

$sqlObj = false;
$sqlObj = $sql->prepare("SELECT ID FROM books WHERE 1 ORDER BY ID DESC LIMIT 1");
$sqlObj->execute();
$result = $sqlObj->get_result();
$last = $result->fetch_assoc();
$id = isset($last['ID']) ? $last['ID'] : 1;


if ($sqlPass) {
    mkdir("../books/$id");
    mkdir("../books/$id/previousVersions");
    file_put_contents("../books/$id/index.php", file_get_contents("../php/templates/bookIndex.php"));
    echo true;
} else {
    echo false;
}
?>