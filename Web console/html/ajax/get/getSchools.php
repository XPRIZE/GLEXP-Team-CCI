<?php
require_once("../../config.php");

chdir('../');
include_once('../../includes/dbConnect.php');
$con = new dbConnect();
$ret = [];
if ($con) {
    $sql = $con->mysqli;
    $stmt = $sql->prepare("SELECT ID, name FROM schools WHERE 1");
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
} else {
    echo "error: Bad sql object";
}

?>