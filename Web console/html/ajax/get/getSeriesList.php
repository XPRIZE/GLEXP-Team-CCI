<?php
/**
 
 * User: Jason
 * Date: 8/26/2016
 * Time: 10:49 AM
 */

chdir('../');
$ret = [];
include('../../includes/dbConnect.php');
$con = new DBConnect();
$sql = $con->mysqli;
$stmt = $sql->prepare("SELECT ID, `name` FROM series ORDER BY `name` ASC");
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