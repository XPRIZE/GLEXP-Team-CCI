<?php
/**
 
 * User: Jason
 * Date: 11/8/2016
 * Time: 4:33 PM
 */

chdir('../');
require('../../includes/loginCheck.php');
require('../php/setSchoolXML.php');
$subject = $_GET['subject'];
$school = $_GET['school'];
$state = isset($_GET['state']) ? $_GET['state'] : "";

$username = false;
if ($ret = loginCheck() === true) {
    $file = isset($_FILES['upload']) ? $_FILES['upload'] : false;
    if ($file) {
        $fileLoc = $file['tmp_name'];
        $fileName = $file['name'];
        $newLoc = "../schools/$school/$subject/icons/";
        if (!is_dir($newLoc)) {
            mkdir($newLoc);
        }
        $newLoc = $newLoc . $fileName;
        rename($fileLoc, $newLoc);
        setSubjectIcon($school, $subject, $fileName, $state);
        echo '{"status":"server","src":"' . $subject . '/icons/' . $fileName . '"}';
    }
}

