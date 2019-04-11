<?php

require_once("../../config.php");

chdir('../');
$seriesOrder = json_decode($_POST['orderByID']);

include_once("../../includes/loginCheck.php");
if (loginCheck()) {
    $con = new DBConnect();
    $sql = $con->mysqli;
    foreach ($seriesOrder as $id => $pri) {
        $sqlObj = $sql->prepare("UPDATE series SET `priority` = ? WHERE ID = ?");
        $sqlObj->bind_param('ss', $pri, $id);
        $sqlObj->execute();
    }
    echo "done";
}
?>