<?php
require_once("../../config.php");

$id = $_GET['id'];
$name = $_GET['name'];

chdir('../');
include_once("../../includes/loginCheck.php");
if (loginCheck()) {
    // Get real path for our folder
    chdir("../books/$id/");
    if (file_exists("$name.zip")) {
        unlink("$name.zip");
    }

    $rootPath = realpath("");

    // Initialize archive object
    $zip = new ZipArchive();
    $zip->open("$name.zip", ZipArchive::CREATE | ZipArchive::OVERWRITE);

    // Create recursive directory iterator
    /** @var SplFileInfo[] $files */
    $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($rootPath), RecursiveIteratorIterator::LEAVES_ONLY
    );


    $excludeFiles = array("index.php", "index.html", "Book.zip",);
    $excludeFolders = array("previousVersions",);

    function in_array_beginning_with($path, $array) {
        foreach ($array as $begin) {
            if (strncmp($path, $begin, strlen($begin)) == 0) {
                return true;
            }
        }
        return false;
    }

    foreach ($files as $name => $file) {
        if (!in_array_beginning_with($files->getSubPath(), $excludeFolders)) {
            if (!$file->isDir()) {
                // Get real and relative path for current file
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen($rootPath) + 1);

                // Add current file to archive
                if (!in_array($relativePath, $excludeFiles)) {
                    $zip->addFile($filePath, $relativePath);
                }
            }
        }
    }

    // Zip archive will be created only after closing object
    $zip->close();

    echo "done";
}