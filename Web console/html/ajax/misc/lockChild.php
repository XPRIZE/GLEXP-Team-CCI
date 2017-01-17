<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 7/2/2016
 * Time: 3:54 PM
 */

chdir('../');
$seriesName = $_GET['seriesName'];
$childName = $_GET['childName'];
$action = $_GET['action'];
if ($action == "true") {
    $action = 1;
}   else    {
    $action = 0;
}

include_once("../../includes/loginCheck.php");
if (loginCheck()) {
    $con = new dbConnect();
    $sql = $con->mysqli;

    $sqlObj = $sql->prepare("UPDATE `children` SET `locked` = ? WHERE `seriesName` = ? AND `childName` = ?");
    if ($sqlObj) {
        $sqlObj->bind_param('iss', $action, $seriesName, $childName);
        $sqlObj->execute();
    }

    echo "done";
} else {
    echo "Not logged in, I detect sabotage, I'm reporting you to the FBI and stuff.";
}

?>

