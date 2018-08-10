<?php
/**
 
 * User: Jason
 * Date: 6/15/2016
 * Time: 2:09 PM
 */

$username = $_POST["username"];
$password = $_POST["password"];

include('../../includes/dbConnect.php');
include('../../includes/login.php');
$con = new DBConnect();
$login = login($con, $username, $password);
if ($login === true) {
    echo "true";
}   else    {
    echo $login;
}


?>