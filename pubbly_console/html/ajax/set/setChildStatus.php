<?php
require_once("../../config.php");


chdir('../');
$seriesName = $_GET['seriesName'];
$childName = $_GET['childName'];
$action = strtolower($_GET['action']);
if (
    $action == "progress" ||
    $action == "complete" ||
    $action == "missing"
) {

    include_once("../../includes/loginCheck.php");
    if (loginCheck()) {
        $con = new dbConnect();
        $sql = $con->mysqli;
        $sqlObj = $sql->prepare("UPDATE `children` SET `status` = ? WHERE `seriesName` = ? AND `childName` = ?");
        if ($sqlObj) {
            $sqlObj->bind_param('sss', $action, $seriesName, $childName);
            $sqlObj->execute();
        }

        echo "done";
    } else {
        echo "Not logged in, I detect sabotage, I'm reporting you to the FBI and stuff.";
    }

}   else    {
    echo "Error: Missing or unrecognized action";
}


?>

