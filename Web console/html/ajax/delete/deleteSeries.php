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

    $swapCount = count($swaps);
    if ($swapCount < 100) {
        $sqlObj = $sql->prepare("DELETE FROM swaps WHERE refSeries = ?");
        if ($sqlObj) {
            $sqlObj->bind_param('s', $seriesName);
            $sqlObj->execute();
        }
        $sqlObj = false;

        $sqlObj = $sql->prepare("DELETE FROM series WHERE name = ?");
        if ($sqlObj) {
            $sqlObj->bind_param('s', $seriesName);
            $sqlObj->execute();
        }
        $sqlObj = false;

        $sqlObj = $sql->prepare("DELETE FROM children WHERE seriesName = ?");
        if ($sqlObj) {
            $sqlObj->bind_param('s', $seriesName);
            $sqlObj->execute();
        }
        $sqlObj = false;

        $sqlObj = $sql->prepare("DELETE FROM childAssetNotes WHERE refSeries = ?");
        if ($sqlObj) {
            $sqlObj->bind_param('s', $seriesName);
            $sqlObj->execute();
        }

        $date = new DateTime();
        $stamp = $date->getTimestamp();
        rename("../series/$seriesName", "../deletedSeries/$seriesName" . "_" . "$stamp");
        file_put_contents("../deletedSeries/$seriesName" . "_" . "$stamp/recovery.js", "var swaps = " . json_encode($swaps) . ";");

        echo "done";
    } else {
        echo "error: There are $swapCount swaps in this series (catch is at 100+). Too scary. Contact Jason if you really want to do this, cause it seems like.. a ton of work you're just throwin' away";
    }
} else {
    echo "Not logged in, I detect sabotage, I'm reporting you to the FBI and stuff.";
}

?>