<?php
/**
 
 * User: Jason
 * Date: 6/30/2016
 * Time: 2:12 PM
 */

chdir('../');
$oldName = $_GET['oldName'];
$newName = $_GET['newName'];
$series = $_GET['series'];

include_once("../../includes/dbConnect.php");
$con = new dbConnect();
$sql = $con->mysqli;
$sqlObj = $sql->prepare("UPDATE swaps SET refBook = ? WHERE refBook = ?");
if ($sqlObj) {
    $sqlObj->bind_param('ss', $newName, $oldName);
    $sqlObj->execute();
}
if ($sqlObj->errno) {
    echo "Error with swaps table</br>";
}

$sqlObj = $sql->prepare("UPDATE children SET childName = ? WHERE seriesName = ? AND childName = ?");
if ($sqlObj) {
    $sqlObj->bind_param('sss', $newName, $series, $oldName);
    $sqlObj->execute();
}
if ($sqlObj->errno) {
    echo "Error with children table</br>";
}

$sqlObj = $sql->prepare("UPDATE childassetnotes SET refBook = ? WHERE refSeries = ? AND refBook = ?");
if ($sqlObj) {
    $sqlObj->bind_param('sss', $newName, $series, $oldName);
    $sqlObj->execute();
}
if ($sqlObj->errno) {
    echo "Error with childassetnotes table</br>";
}

$sqlObj = $sql->prepare("UPDATE unitPages SET refChild = ? WHERE refSeries = ? AND refChild = ?");
if ($sqlObj) {
    $sqlObj->bind_param('sss', $newName, $series, $oldName);
    $sqlObj->execute();
}
if ($sqlObj->errno) {
    echo "Error with unitPages table</br>";
}

rename("../series/$series/$oldName.php", "../series/$series/$newName.php");
if (is_dir("../series/$series/$oldName.html")) {
    rename("../series/$series/$oldName.html", "../series/$series/$newName.html");
}
rename("../series/$series/$oldName.xml", "../series/$series/$newName.xml");

$xmlLoc = "../series/$series/$newName.xml";
$xml = simplexml_load_file($xmlLoc);
$xml->preserveWhiteSpace = false;
$xml->formatOutput = true;
$xml->Info->PrjName = $newName;
$xml->Info->PrjNameLong = $newName;
saveXML($xml, $xmlLoc);

function saveXML($node, $loc)
{
    $str = file_get_contents($loc);
    $str = preg_replace("/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n]+/", "\n", $str);
    file_put_contents($loc, $str);    // Pretty print the xml.
    $domxml = new DOMDocument('1.0');
    $domxml->preserveWhiteSpace = false;
    $domxml->formatOutput = true;
    $domxml->loadXML($node->asXML());
    $domxml->save($loc);
}

echo "done";

?>