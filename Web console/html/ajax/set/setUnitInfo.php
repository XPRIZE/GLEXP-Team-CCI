<?php

/**
 
 * User: Jason
 * Date: 9/23/2016
 * Time: 3:10 PM
 */
$unit = $_GET['unitName'];
$level = isset($_GET['levelName']) ? $_GET['levelName'] : false;
$subject = isset($_GET['subjectName']) ? $_GET['subjectName'] : false;
$isTutorial = isset($_GET['isTutorial']) ? $_GET['isTutorial'] : false;
$school = $_GET['schoolName'];
chdir('../');
if ($isTutorial) {
    $xmlLoc = "../schools/$school/tutorials/$unit/MainXML.xml";
} else {
    $xmlLoc = "../schools/$school/$subject/$level/$unit/MainXML.xml";
}
$xml = simplexml_load_file($xmlLoc);
$xml->preserveWhiteSpace = false;
$xml->formatOutput = true;
foreach ($_POST as $prop => $val) {
    $xml->Info->$prop = $val;
}
saveXML($xml, $xmlLoc);

function saveXML($node, $loc) {
    $str = file_get_contents($loc);
    $str = preg_replace("/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n]+/", "\n", $str);
    file_put_contents($loc, $str);    // Pretty print the xml.
    $domxml = new DOMDocument('1.0');
    $domxml->preserveWhiteSpace = false;
    $domxml->formatOutput = true;
    $domxml->loadXML($node->asXML());
    $domxml->save($loc);
}

?>