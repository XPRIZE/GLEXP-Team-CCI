<?php
/**
 
 * User: Jason
 * Date: 10/26/2016
 * Time: 10:57 AM
 */

require("../../includes/dbConnect.php");

function outdateUnit($id)
{
    $con = new DBConnect();
    $sql = $con->mysqli;
    $obj = $sql->prepare("UPDATE units SET outdated = 1 WHERE ID = ?");
    $obj->bind_param('s', $id);
    $obj->execute();
}

function outdateBySeriesAndChild($series, $child) {
    $idsAlreadyDone = [];
    $con = new DBConnect();
    $sql = $con->mysqli;
    $sqlObj = $sql->prepare("SELECT unitID FROM unitPages WHERE refSeries = ? AND refChild = ?");
    $sqlObj->bind_param('ss', $series, $child);
    $sqlObj->execute();
    $result = $sqlObj->get_result();
    while ($ids = $result->fetch_assoc()) {
        $id = $ids['unitID'];
        if (!isset($idsAlreadyDone[$id])) {
            $idsAlreadyDone[$id] = true;
            outdateUnit($id);
        }
    }
    $result->free();
}

function outdateBySeries($series) {
    $idsAlreadyDone = [];
    $con = new DBConnect();
    $sql = $con->mysqli;
    $sqlObj = $sql->prepare("SELECT unitID FROM unitPages WHERE refSeries = ?");
    $sqlObj->bind_param('s', $series);
    $sqlObj->execute();
    $result = $sqlObj->get_result();
    while ($ids = $result->fetch_assoc()) {
        $id = $ids['unitID'];
        if (!isset($idsAlreadyDone[$id])) {
            $idsAlreadyDone[$id] = true;
            outdateUnit($id);
        }
    }
    $result->free();
}
