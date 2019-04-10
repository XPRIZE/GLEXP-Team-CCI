<?php
require_once("../../config.php");


chdir('../');
require('../../includes/loginCheck.php');
require('../php/setSchoolXML.php');
$school = $_GET['school'];

$username = false;
if ($ret = loginCheck() === true) {
    $file = isset($_FILES['upload']) ? $_FILES['upload'] : false;
    if ($file) {
        $fileLoc = $file['tmp_name'];
        $fileName = $file['name'];
        $newLoc = "../schools/$school/icons/";
        if (!is_dir($newLoc)) {
            mkdir($newLoc);
        }
        $newLoc = $newLoc . $fileName;
        rename($fileLoc, $newLoc);
        setDefaultBG($school, $fileName);
        echo '{"status":"server","src":"/icons/' . $fileName . '"}';
    }
}