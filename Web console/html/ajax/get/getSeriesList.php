<?php
require_once("../../config.php");


chdir('../');
$ret = [];
include('../../includes/dbConnect.php');
$con = new DBConnect();
$sql = $con->mysqli;
$stmt = $sql->prepare("SELECT ID, `name`, `folder` FROM series ORDER BY `priority` ASC, `ID` DESC");
$stmt->execute();
if ($result = $stmt->get_result()) {
    /* fetch associative array */
    while ($row = $result->fetch_assoc()) {
        array_push($ret, $row);
    }
    $result->free();
    echo json_encode($ret);
} else {
    echo "error: bad sql stmt";
}

?>