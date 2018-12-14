<?php
require_once("../../config.php");


chdir('../');

$file = isset($_FILES['upload']) ? $_FILES['upload'] : false;
$bookName = isset($_GET['bookName']) ? $_GET['bookName'] : false;

$id = false;
include('../../includes/dbConnect.php');
$con = new DBConnect();
$sql = $con->mysqli;
$sqlObj = false;
$sqlObj = $sql->prepare("SELECT ID FROM books WHERE `name` = ?");
$sqlObj->bind_param('s', $bookName);
$sqlObj->execute();
$result = $sqlObj->get_result();
$last = $result->fetch_assoc();
$id = $last['ID'];
$sqlObj = false;

if ($file) {
    if ($bookName) {
        if ($file['type'] == "application/x-zip-compressed" || $file['type'] == "application/zip") {
            $tmpLoc = $file['tmp_name'];
            $bookLoc = "../books/$id/NewBook.zip";
            move_uploaded_file($tmpLoc, $bookLoc);
            // unzip book
            $parent = new ZipArchive;
            if ($parent->open($bookLoc) === TRUE) {
                chdir("../books/$id");
                // Make a new folder in previousVersions, one greater than the last folder there.
                $versions = scandir(getCWD() . '/previousVersions/');
                $lastVersion = 0;
                foreach ($versions as &$version) {
                    if ($version != "." && $version != "..") {
                        if ($version > $lastVersion) {
                            $lastVersion = $version;
                        }
                    }
                }
                $lastVersion++;

                // Stick everything in this directory (except edit.php and NewParent.zip) into the latest version folder.
                mkdir("previousVersions/$lastVersion");

                $files = scandir(getCWD());
                foreach ($files as &$file) {
                    // TODO: put all the "don't move" files into a "don't move" array, check the arr instead, reduce this 10 foot line.
                    if ($file == "." || $file == ".." || $file == "previousVersions" || $file == "index.php" || $file == "NewBook.zip") {
                        // Keep em.
                    } else {
                        rename($file, "previousVersions/$lastVersion/" . $file);
                    }
                }
                $parent->extractTo(getCWD());
                $parent->close();
                rename("NewBook.zip", "Book.zip");

                // Save original XML for ray's future rebuild.
                copy("MainXML.xml", "OriginalBookXML.xml");
                // Open XML, delete anything we don't need. (spring cleaning)
                $xml = simplexml_load_file("MainXML.xml");
                $xml->preserveWhiteSpace = false;
                $xml->formatOutput = true;
                $uselessInfo = ["ProjectIds", "LastUsedImgFolderPath", "AudioFileTimes", "MobileScaling",
                    "TabClosedOn", "ProjectSizeInKilobytes", "BookPoints", "CompositePrepared", "LastMouseLoc",
                    "ProjectName", "CurrentRect", "MobileOrientations", "LastChosenScreenRestrictions", "ProjectVersion",
                    "LastTopLeft", "FrameBackgroundColor", /*"BrowserBackgroundColor", */
                    "ProjectCategory",
                    "LockWindowSize", "OrigTopLeft", "SameMouseLocThreshold", "PrjRect", "LastPageSpread"];
                foreach ($uselessInfo as &$type) {
                    if ($xml->Info->$type) {
                        unset($xml->Info->$type);
                    }
                }

                $pageCount = count($xml->Pages->Page);
                $sqlObj = $sql->prepare("UPDATE books SET `pages` = ? WHERE ID = ?");
                $sqlObj->bind_param('ss', $pageCount, $id);
                $sqlObj->execute();

                saveXML($xml, "MainXML.xml");

                // Outdate the units that use pages from this book.
                $idsAlreadyDone = [];
                $con = new DBConnect();
                $sql = $con->mysqli;
                $sqlObj = $sql->prepare("SELECT unitID FROM unitPages WHERE refBook = ?");
                $sqlObj->bind_param('s', $bookName);
                $sqlObj->execute();
                $result = $sqlObj->get_result();
                /* fetch associative array */
                while ($ids = $result->fetch_assoc()) {
                    $id = $ids['unitID'];
                    if (isset($idsAlreadyDone[$id])) {
                        // Already outdated that unit.
                    }   else    {
                        $idsAlreadyDone[$id] = true;
                        outdateUnit($id);
                    }
                }
                if ($result->lengths) {
                    $result->free();
                }

                echo '{"status":"server"}';
            }
        } else {
            echo '{"status":"error"}';
            // echo "error: Only zip files please";
        }
    } else {
        echo '{"status":"error"}';
        // echo "error: Series name missing";
    }
} else {
    echo '{"status":"error"}';
    // echo "error: No file uploaded";
}


function outdateUnit($id)
{
    $con = new DBConnect();
    $sql = $con->mysqli;
    $obj = $sql->prepare("UPDATE units SET outdated = 1 WHERE ID = ?");
    $obj->bind_param('s', $id);
    $obj->execute();
}

function saveXML($node, $name)
{
    // delete blank lines
    $str = file_get_contents($name);
    $str = preg_replace("/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n]+/", "\n", $str);
    file_put_contents($name, $str);
    // Pretty print the xml.
    $domxml = new DOMDocument('1.0');
    $domxml->preserveWhiteSpace = false;
    $domxml->formatOutput = true;
    $domxml->loadXML($node->asXML());
    $domxml->save($name);
}

function recurse_copy($src, $dst)
{
    $dir = opendir($src);
    @mkdir($dst);
    while (false !== ($file = readdir($dir))) {
        if (($file != '.') && ($file != '..')) {
            if (is_dir($src . '/' . $file)) {
                recurse_copy($src . '/' . $file, $dst . '/' . $file);
            } else {
                copy($src . '/' . $file, $dst . '/' . $file);
            }
        }
    }
    closedir($dir);
}


?>