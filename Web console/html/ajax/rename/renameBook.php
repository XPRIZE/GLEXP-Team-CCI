<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 8/24/2016
 * Time: 2:01 PM
 */

$id = isset($_GET['id']) ? $_GET['id'] : false;
$name = isset($_GET['name']) ? $_GET['name'] : false;
$longName = isset($_GET['longname']) ? $_GET['longname'] : false;
$oldName = isset($_GET['oldname']) ? $_GET['oldname'] : false;

if (!$name && !$longName) {
    echo "error: no name or longname";
} else if (!$id) {
    echo "error: no ID";
} else {
    include_once("../../../includes/dbConnect.php");
    $con = new dbConnect();
    $sql = $con->mysqli;
    if ($longName) {
        $sqlObj = $sql->prepare("UPDATE books SET longname = ? WHERE ID = ?");
        $sqlObj->bind_param('ss', $longName, $id);
        $sqlObj->execute();
        echo "done";
    }

    if ($name) {
        $taken = false;
        $sqlObj = $sql->prepare("SELECT `ID` FROM `books` WHERE `name` = ?");
        $sqlObj->bind_param('s',$name);
        $sqlObj->execute();
        $sqlObj->store_result();
        $taken = $sqlObj->num_rows;
        if ($taken) {
            echo "taken";
        }   else    {
            $sqlObj = $sql->prepare("UPDATE books SET `name` = ? WHERE ID = ?");
            $sqlObj->bind_param('ss', $name, $id);
            $sqlObj->execute();
            if ($oldName) {
                $sqlObj = $sql->prepare("UPDATE unitPages SET `refBook` = ? WHERE `refBook` = ?");
                $sqlObj->bind_param('ss', $name, $oldName);
                $sqlObj->execute();
            }
            echo "done";
        }
    }
}


?>