<?php

ini_set('max_execution_time', 900); // 15 minutes

chdir("../../");
require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(WEB_ROOT . "/php/main.php");
require_once(CLASS_ROOT . "/mysql_query.php");
require_once(CLASS_ROOT . "/sec_session.php");
require_once(CLASS_ROOT . "/html_fragment.php");

require_once(WEB_ROOT . "/php/recursives.php");


if (LOGGED_IN && isset($_GET['mapName'])) {
    $mapName = $_GET['mapName'];
    $exportType = isset($_GET['type']) ? $_GET['type'] : "local";

    $query = new Mysql_query();
    $entranceNodeName = $query->fetchSingle("SELECT mn.name FROM map mp LEFT JOIN map_node mn ON mp.map_id = mn.map_id WHERE mp.name = ? AND mn.is_entry = 1", ["s", $mapName]);
    if ($entranceNodeName) {
        // first remove any old exports
        $mapServerLoc = "map/$mapName";
        $mapExportLoc = "download/map/$mapName";
        $mapExportFile = "$mapExportLoc/$mapName-$exportType.zip";

        rrmdir($mapExportLoc);
        mkdir($mapExportLoc);

        function checkNode($loc)
        {
            if (
                file_exists("$loc/cover.png")
                && file_exists("$loc/MainXML.xml")
            ) {
                return true;
            } else {
                return false;
            }
        }
        $errorMessage = "";
        $files = scandir("$mapServerLoc");
        foreach ($files as $nodePath) {
            if ($nodePath !== "." && $nodePath !== ".." && is_dir("$mapServerLoc/$nodePath")) {
                if (checkNode("$mapServerLoc/$nodePath")) {
                    rcopy("$mapServerLoc" . "/" . "$nodePath", "$mapExportLoc" . "/" . "$nodePath");
                    if ($exportType === "market") {
                        $nodeFiles = scandir("$mapExportLoc/$nodePath");
                        foreach ($nodeFiles as $nodeFile) {
                            // Get rid of HTML, could interfere.
                            if (count(explode(".html", $nodeFile)) > 1) {
                                unlink("$mapExportLoc/$nodePath/$nodeFile");
                            }
                        }
                    } else if ($exportType === "local") {
                        $runIndexLoc = "pubbly_engine/html/offline-xml.html";

                        // Forget JSOn, just build from XML
                        if (file_exists("$mapExportLoc/$nodePath/MainXML.xml")) {
                            $xmlStr = file_get_contents("$mapExportLoc/$nodePath/MainXML.xml");
                            $frag = new Html_fragment($runIndexLoc, [
                                ["PATH_TO_ENGINE", "pubbly_engine/"],
                                ["ENGINE", "latest"],
                                ["START_PAGE", 0],
                                ["PATH_TO_BOOK", "$nodePath"],
                                ["XML_STRING", $xmlStr],
                            ]);
                            $frag->printOut("$mapExportLoc/$nodePath.html");
                        }
                    }
                } else {
                    $errorMessage .= "$nodePath is missing a cover, ";
                }
            }
        }
        if ($errorMessage === "") {
            if ($exportType === "market") {
                file_put_contents("$mapExportLoc/entrance.txt", "$entranceNodeName");
                file_put_contents("$mapExportLoc/name.txt", "$mapName");
            } else if ($exportType === "local") {
                $entranceHTML = "<html><head><script>window.location.href = '" .
                    $entranceNodeName . ".html';</script></head></html>";
                file_put_contents("$mapExportLoc/index.html", $entranceHTML);
            };
            if ($exportType === "market") {
                $noZip = array("index.php", "index.html");
            } else if ($exportType === "local") {
                $noZip = array("index.php");
            }

            $rootPath = realpath($mapExportLoc);
            $zip = new ZipArchive();
            $zip->open($mapExportFile, ZipArchive::CREATE | ZipArchive::OVERWRITE);
            $files = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($rootPath),
                RecursiveIteratorIterator::LEAVES_ONLY
            );
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
            if ($exportType === "local") {
                $rootPath = realpath("pubbly_engine");
                $engineFiles = new RecursiveIteratorIterator(
                    new RecursiveDirectoryIterator($rootPath),
                    RecursiveIteratorIterator::LEAVES_ONLY
                );
                foreach ($engineFiles as $name => $file) {
                    if (!$file->isDir()) {
                        $filePath = $file->getRealPath();
                        $relativePath = "pubbly_engine/" . substr($filePath, strlen($rootPath) + 1);
                        $zip->addFile($filePath, $relativePath);
                    }
                }
            }

            // Zip archive will be created only after closing object
            $zip->close();
            echo '{"status":"success", "message": "Everything worked dawg", "url": "' . $mapExportFile . '"}';
        } else {
            echo '{"status":"error","message":"' . $errorMessage . '"}';
        }
    } else {
        echo '{"status":"error","message":"Map does not have an entrance!"}';
    }
} else {
    echo '{"status":"error","message":"Not logged in"}';
}
