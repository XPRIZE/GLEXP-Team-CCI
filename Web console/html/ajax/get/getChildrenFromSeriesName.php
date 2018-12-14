<?php
require_once("../../config.php");

$seriesName = $_GET['seriesName'];
$ret = [];

chdir('../');
include('../../includes/dbConnect.php');
$con = new DBConnect();
$sql = $con->mysqli;
$stmt = $sql->prepare("SELECT childID, childName FROM children WHERE seriesName = ? ORDER BY childID ASC");
$stmt->bind_param('s', $seriesName);
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