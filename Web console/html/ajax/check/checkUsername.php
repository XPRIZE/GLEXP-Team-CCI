<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 7/7/2016
 * Time: 3:12 PM
 */

chdir('../');
include('../../includes/dbConnect.php');
$requestedName = $_GET["username"];
$con = new DBConnect();
$sql = $con->mysqli;
$prep_stmt = "SELECT username FROM users WHERE username = ?";
$stmt = $sql->prepare($prep_stmt);
if ($stmt) {
    $stmt->bind_param('s', $requestedName);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows == 1) {
        $stmt->close();
        echo "taken";
    } else {
        echo "available";
    }
} else {
    $stmt->close();
    echo "error: Bad sql object";
}


?>