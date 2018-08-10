<?php
/**
 
 * User: Jason
 * Date: 11/8/2016
 * Time: 4:33 PM
 */

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
        setScrapbookIcon($school, $fileName);
        echo '{"status":"server","src":"/icons/' . $fileName . '"}';
    }   else    {
        echo '{"status":"error","message":"No file"}';
    }
}   else    {
    echo '{"status":"error","message":"Bad login"}';
}