<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 8/26/2016
 * Time: 11:10 AM
 */

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