<?php
require_once("../../config.php");

$unit = $_GET['unitName'];
$school = $_GET['schoolName'];
chdir('../../');
$xmlLoc = "schools/$school/$unit/MainXML.xml";
if (file_exists($xmlLoc)) {
    $xml = simplexml_load_file($xmlLoc);
    $info = ["TimeToInterrupt", "PrjNameLong", "ReturnPageToPreviousStateOnInterruptions", "DisallowPageNavigation"];
    $ret = array();
    for ($i = 0; $i < count($info); $i++) {
        $prop = $info[$i];
        $ret[$prop] = (string) $xml->Info->$prop;
    }

    echo json_encode($ret);
}
?>