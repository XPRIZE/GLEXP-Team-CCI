<?php
require_once("../../config.php");

chdir('../');
$seriesName = $_GET['seriesName'];
include_once("../../includes/loginCheck.php");
if (loginCheck()) {
    $con = new dbConnect();
    $sql = $con->mysqli;

    $stmt = $sql->prepare("SELECT * FROM swaps WHERE refSeries = ?");
    $stmt->bind_param('s', $seriesName);
    $stmt->execute();
    $result = $stmt->get_result();
    $swaps = array();
    while ($row = $result->fetch_assoc()) {
        array_push($swaps, $row);
    }
    $result->free();
    file_put_contents("../series/$seriesName/recovery.js", "var swaps = " . json_encode($swaps) . ";");

    $base = "../series/$seriesName";
    $loc = "../downloads/$seriesName" . "_backup.zip";
    if (is_dir($loc)) {
        unlink($loc);
    }

    $zip = new ZipArchive;
    if ($zip->open("../downloads/$seriesName" . "_backup.zip", ZipArchive::CREATE) === TRUE) {
        $zip->addFile("$base/recovery.js", "recovery.js");

        $zip->addEmptyDir('audio');
        if ($handle = opendir("$base/audio")) {
            while (false !== ($file = readdir($handle))) {
                if ('.' === $file) continue;
                if ('..' === $file) continue;
                $zip->addFile("$base/audio/$file","audio/$file");
            }
            closedir($handle);
        }

        $zip->addEmptyDir('images');
        if ($handle = opendir("$base/images")) {
            while (false !== ($file = readdir($handle))) {
                if ('.' === $file) continue;
                if ('..' === $file) continue;
                $zip->addFile("$base/images/$file","images/$file");
            }
            closedir($handle);
        }

        $zip->addFile("$base/Parent.xml", "Parent.xml");

        if ($handle = opendir($base)) {
            while (false !== ($file = readdir($handle))) {
                if ('.' === $file) continue;
                if ('..' === $file) continue;
                $split = explode(".", $file);
                if (count($split) > 1 && $split[1] == "xml") {
                    $zip->addFile("$base/$file", $file);
                }
            }
            closedir($handle);
        }
        // close and save archive
        $zip->close();
        echo "downloads/$seriesName" . "_backup.zip";
    }
}

?>