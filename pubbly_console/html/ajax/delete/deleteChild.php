<?php
require_once("../../config.php");

chdir('../');
$seriesName = $_GET['seriesName'];
$childName = $_GET['childName'];

include_once("../../includes/loginCheck.php");
if (loginCheck()) {
    $con = new dbConnect();
    $sql = $con->mysqli;

    $childNum = getChildNumberFromSeriesNameAndChildName($seriesName, $childName);

    $stmt = $sql->prepare("SELECT * FROM swaps WHERE refSeries = ? AND refBook = ?");
    $stmt->bind_param('ss', $seriesName, $childName);
    $stmt->execute();
    $result = $stmt->get_result();
    $swaps = array();
    while ($row = $result->fetch_assoc()) {
        array_push($swaps, $row);
    }
    $result->free();

    $sqlObj = $sql->prepare("DELETE FROM swaps WHERE refSeries = ? AND refBook = ?");
    if ($sqlObj) {
        $sqlObj->bind_param('ss', $seriesName, $childName);
        $sqlObj->execute();
    }
    $sqlObj = false;

    $sqlObj = $sql->prepare("DELETE FROM children WHERE seriesName = ? AND childName = ?");
    if ($sqlObj) {
        $sqlObj->bind_param('ss', $seriesName, $childName);
        $sqlObj->execute();
    }
    $sqlObj = false;

    $sqlObj = $sql->prepare("DELETE FROM childAssetNotes WHERE refSeries = ? AND refBook = ?");
    if ($sqlObj) {
        $sqlObj->bind_param('ss', $seriesName, $childName);
        $sqlObj->execute();
    }

    $sqlObj = $sql->prepare("DELETE FROM unitPages WHERE refSeries = ? AND refChild = ?");
    if ($sqlObj) {
        $sqlObj->bind_param('ss', $seriesName, $childName);
        $sqlObj->execute();
    }
    $sqlObj = false;

    $sqlObj = $sql->prepare("DELETE FROM unitPages WHERE refSeries = ? AND refChild = ?");
    if ($sqlObj) {
        $sqlObj->bind_param('ss', $seriesName, $childName);
        $sqlObj->execute();
    }
    $sqlObj = false;

    $date = new DateTime();
    $stamp = $date->getTimestamp();
    $dir = "../deletedChildren/$seriesName" . "_" . "$childName" . "_" . "$stamp/";
    mkdir($dir);
    file_put_contents("$dir/recovery.js", "var swaps = " . json_encode($swaps) . ";");
    rename("../series/$seriesName/$childName.xml", "$dir/$childName.xml");
    rename("../series/$seriesName/$childName.php", "$dir/$childName.php");

    $prefix = "C" . $childNum;
    $len = strlen($prefix);

    $images = scandir("../series/$seriesName/images");
    mkdir("$dir/images");
    foreach ($images as &$image) {
        if ($image != "." && $image != "..") {
            if (substr($image, 0, $len) == $prefix) {
                rename("../series/$seriesName/images/$image", "$dir/images/$image");
            }
        }
    }

    $audios = scandir("../series/$seriesName/audio");
    mkdir("$dir/audio");
    foreach ($audios as &$audio) {
        if ($audio != "." && $audio != "..") {
            if (substr($audio, 0, $len) == $prefix) {
                rename("../series/$seriesName/audio/$audio", "$dir/audio/$audio");
            }
        }
    }


    echo "done";
} else {
    echo "Not logged in, I detect sabotage, I'm reporting you to the FBI and stuff.";
}

function getChildNumberFromSeriesNameAndChildName($seriesName, $childName)
{
    include_once("../../includes/dbConnect.php");
    $nextID = 0;
    $con = new DBConnect();
    $sql = $con->mysqli;
    $stmt = $sql->prepare("SELECT childID FROM children WHERE seriesName = ? AND childName = ?");
    $stmt->bind_param('ss', $seriesName, $childName);
    $stmt->execute();
    if ($result = $stmt->get_result()) {
        /* fetch associative array */
        while ($row = $result->fetch_assoc()) {
            $id = $row["childID"];
        }
        $result->free();
        return $id;
    } else {
        echo "error: bad sql stmt";
    }
}

?>