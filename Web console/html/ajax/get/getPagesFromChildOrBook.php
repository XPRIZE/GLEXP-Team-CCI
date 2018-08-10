<?php
/**
 
 * User: Jason
 * Date: 8/26/2016
 * Time: 11:36 AM
 */

chdir('../');
$loc = false;

$childOrBook = $_GET['childOrBook'];
if ($childOrBook == "child") {
    $seriesName = $_GET['seriesName'];
    $childName = $_GET['childName'];
    $loc = $loc . "../series/" . $seriesName . "/" . $childName . ".xml";
}   else if ($childOrBook == "book")   {
    $bookID = $_GET['bookID'];
    $loc = $loc . "../books/" . $bookID . "/MainXML.xml";
}

include('../php/getPageInfoByLoc.php');
$ret = getPageInfoByLoc($loc);
echo json_encode($ret);



?>