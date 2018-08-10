<?php
/**
 
 * User: Jason
 * Date: 6/27/2016
 * Time: 2:40 PM
 */

function getChildrenByParentName($seriesName)
{
    $children = [];

    include_once('../../includes/dbConnect.php');
    $con = new dbConnect();
    $sql = $con->mysqli;

    $sqlObj = $sql->prepare("SELECT childName FROM children WHERE seriesName = ? AND deleted = 0 ORDER BY childName");
    if ($sqlObj) {
        $sqlObj->bind_param('s', $seriesName);
        $sqlObj->execute();
        if ($result = $sqlObj->get_result()) {
            /* fetch associative array */
            while ($row = $result->fetch_assoc()) {
                array_push($children, $row["childName"]);
            }
            $result->free();
        } else {
            echo "error: bad sql stmt (commonDBQueries.php)";
        }
    } else {
        echo "error: bad sql obj (commonDBQueries.php)";
    }
    return $children;
}

function setSwapModified($seriesName, $childName, $newAssetName) {
    include_once('../../includes/dbConnect.php');
    $con = new dbConnect();
    $sql = $con->mysqli;

    // HERE is the bad sql object
    $sqlObj = $sql->prepare("UPDATE `swaps` SET `fileModified` = 1 WHERE refSeries = ? AND refBook = ? AND newAssetName = ?");
    if ($sqlObj) {
        $sqlObj->bind_param('sss',$seriesName, $childName, $newAssetName);
        $sqlObj->execute();
        return true;
    }
}


?>