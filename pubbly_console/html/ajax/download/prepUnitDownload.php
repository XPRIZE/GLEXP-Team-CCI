<?php
require_once("../../config.php");

$loc = $_GET['loc'];
$name = $_GET['name'];

chdir('../');
include_once("../../includes/loginCheck.php");
chdir('../');
if (loginCheck()) {
    // Get real path for our folder
    chdir($loc);
    if (file_exists("$name.zip")) {
        unlink("$name.zip");
    }
    $rootPath = realpath("");

    // Initialize archive object
    $zip = new ZipArchive();
    $zip->open("$name.zip", ZipArchive::CREATE | ZipArchive::OVERWRITE);

    // Create recursive directory iterator
    $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($rootPath), RecursiveIteratorIterator::LEAVES_ONLY
    );

    $noZip = array("index.php", "index.html");

    foreach ($files as $name => $file) {
        // Skip directories (they would be added automatically)
        if (!$file->isDir()) {
            // Get real and relative path for current file
            $filePath = $file->getRealPath();
            $relativePath = substr($filePath, strlen($rootPath) + 1);

            // Add current file to archive
            if (!in_array($relativePath, $noZip)) {
                $zip->addFile($filePath, $relativePath);
            }
        }
    }

    // Zip archive will be created only after closing object
    $zip->close();
    echo "done";
}