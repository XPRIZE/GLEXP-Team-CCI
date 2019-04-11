<?php

require_once("../../config.php");

chdir('../');
require('../../includes/loginCheck.php');
$school = base64_decode($_GET['sc']);
$subject = base64_decode($_GET['su']);
$level = base64_decode($_GET['l']);
$unit = base64_decode($_GET['u']);
if ($ret = loginCheck() === true) {
    $file = isset($_FILES['upload']) ? $_FILES['upload'] : false;
    if ($file) {
        $fileLoc = $file['tmp_name'];
        $fileName = $file['name'];
        $newLoc = "../schools/$school/$subject/$level/$unit/cover.png";
        rename($fileLoc, $newLoc);

        $con = new DBConnect();
        $sql = $con->mysqli;
        $obj = $sql->prepare("UPDATE schools SET outdated = 1 WHERE name = ?");
        $obj->bind_param('s', $school);
        $obj->execute();
        echo '{"status":"server","src":"/icons/' . $fileName . '"}';
    } else {
        echo '{"status":"error","message":"No file"}';
    }
} else {
    echo '{"status":"error","message":"Bad login"}';
}