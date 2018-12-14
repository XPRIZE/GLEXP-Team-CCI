<?php
require_once("../../config.php");


chdir('../');
$childName = $_GET['childName'];
$seriesName = $_GET['seriesName'];

include('../../includes/dbConnect.php');

$nextID = getNextID($seriesName);

$con = new DBConnect();
$sql = $con->mysqli;
$sqlObj = $sql->prepare("INSERT INTO children (seriesName, childName, childID) VALUES (?, ?, ?)");
if ($sqlObj) {
    $sqlObj->bind_param('sss', $seriesName, $childName, $nextID);
    $sqlObj->execute();
    $sqlPass = true;
} else {
    echo "error: bad sql obj";
}

function getNextID($seriesName)
{
    $nextID = 0;
    include_once('../../includes/dbConnect.php');
    $con = new DBConnect();
    $sql = $con->mysqli;
    $stmt = $sql->prepare("SELECT childID FROM children WHERE seriesName = ?");
    $stmt->bind_param('s', $seriesName);
    $stmt->execute();
    if ($result = $stmt->get_result()) {
        /* fetch associative array */
        while ($row = $result->fetch_assoc()) {
            $nextID = $row["childID"];
        }
        $result->free();
        return $nextID + 1;
    } else {
        echo "error: bad sql stmt";
    }

}

if ($sqlPass) {
    $rootLoc = "../series/$seriesName";
    $childLoc = "$rootLoc/$childName";
    file_put_contents("$childLoc.php", file_get_contents("../php/templates/childIndex.php"));
    copy("$rootLoc/Parent.xml", "$childLoc.xml");

    $xml = simplexml_load_file("$childLoc.xml");
    $xml->preserveWhiteSpace = false;
    $xml->formatOutput = true;
    $xml->Info->PrjName = $childName;
    $xml->Info->PrjNameLong = $childName;

    $str = file_get_contents("$childLoc.xml");
    $str = preg_replace("/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n]+/", "\n", $str);
    file_put_contents("$childLoc.xml", $str);
    $domxml = new DOMDocument('1.0');
    $domxml->preserveWhiteSpace = false;
    $domxml->formatOutput = true;
    $domxml->loadXML($xml->asXML());
    $domxml->save("$childLoc.xml");

    echo "done";
} else {
    echo "error: Sql didn't pass";
}

?>