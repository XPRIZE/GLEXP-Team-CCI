<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 6/30/2016
 * Time: 10:43 AM
 */

chdir('../');
$oldName = $_GET['oldName'];
$newName = $_GET['newName'];


include_once("../../includes/dbConnect.php");
$con = new dbConnect();
$sql = $con->mysqli;
$sqlObj = $sql->prepare("UPDATE swaps SET refSeries = ? WHERE refSeries = ?");
if ($sqlObj) {
    $sqlObj->bind_param('ss', $newName, $oldName);
    $sqlObj->execute();
}
if ($sqlObj->errno) {
    echo "Error with swaps table</br>";
}
$sqlObj = $sql->prepare("UPDATE series SET name = ? WHERE name = ?");
if ($sqlObj) {
    $sqlObj->bind_param('ss', $newName, $oldName);
    $sqlObj->execute();
}
if ($sqlObj->errno) {
    echo "Error with series table</br>";
}

$sqlObj = $sql->prepare("UPDATE children SET seriesName = ? WHERE seriesName = ?");
if ($sqlObj) {
    $sqlObj->bind_param('ss', $newName, $oldName);
    $sqlObj->execute();
}
if ($sqlObj->errno) {
    echo "Error with children table</br>";
}

$sqlObj = $sql->prepare("UPDATE childassetnotes SET refSeries = ? WHERE refSeries = ?");
if ($sqlObj) {
    $sqlObj->bind_param('ss', $newName, $oldName);
    $sqlObj->execute();
}
if ($sqlObj->errno) {
    echo "Error with childassetnotes table</br>";
}

$sqlObj = $sql->prepare("UPDATE unitPages SET refSeries = ? WHERE refSeries = ?");
if ($sqlObj) {
    $sqlObj->bind_param('ss', $newName, $oldName);
    $sqlObj->execute();
}
if ($sqlObj->errno) {
    echo "Error with unitPages table</br>";
}

rename("../series/$oldName", "../series/$newName");

echo "done";


?>