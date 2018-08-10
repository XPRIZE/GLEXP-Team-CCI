<?php
/**
 
 * User: Jason
 * Date: 11/3/2016
 * Time: 12:04 PM
 */

$bUrl = $_GET['imgUrl'];

$file = $_FILES['fileChooser'];
$fileName = $file['name'];
$imgPath = $_SERVER["DOCUMENT_ROOT"] . $bUrl . "/tmp/" . $fileName;
if (!is_dir($_SERVER["DOCUMENT_ROOT"] . $bUrl . "/tmp/")) {
    mkdir($_SERVER["DOCUMENT_ROOT"] . $bUrl . "/tmp/");
}

move_uploaded_file($file['tmp_name'],$imgPath);
echo $fileName;

// seriously?

?>