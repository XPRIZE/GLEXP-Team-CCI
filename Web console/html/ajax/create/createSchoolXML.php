<?php
require_once("../../config.php");

chdir('../');
require('../../includes/loginCheck.php');
require('../php/setSchoolXML.php');
$school = $_GET['school'];

if ($ret = loginCheck() === true) {
    $xmlLoc = "../schools/$school/school.xml";
    // Create xml
    if (!file_exists($xmlLoc)) {
	file_put_contents($xmlLoc, "<school><name>$school</name><subjects></subjects><translations></translations></school>");
	echo "done";
    } else {
	echo "error: School already exists";
    }
}