<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 6/27/2016
 * Time: 2:28 PM
 */

chdir('../');
$retObj = [];

$seriesName = $_GET['seriesName'];

if (isset($seriesName)) {
    include("../php/commonDBQueries.php");
    $children = getChildrenByParentName($seriesName);

    $xml = simplexml_load_file("../series/$seriesName/Parent.xml");
    $xml->preserveWhiteSpace = false;
    $xml->formatOutput = true;

    $variableImages = [];
    $variableAudios = [];
    $variableFields = [];
    $i = 1;
    // Get all variable assets (images and audios)
    foreach ($xml->Assets->children() as $child) {
        if (strtolower((string)$child->FixedOrVariable) == "variable") {
            if ((string)$child->Type == "Image") {
                $variableImages[(string)$child->Source] = $i;
                $i++;
            } else if ((string)$child->Type == "Audio") {
                $fileName = trimExtension((string)$child->Source);
                $variableAudios[$fileName] = $i;
                $i++;
            } else if ((string)$child->Type == "Field") {
                $fieldName = (string)$child->Source;
                $variableFields[$fieldName] = $i;
                $i++;
            }
        }
    }

    $retObj['parent'] = [];
    $retObj['parent']['name'] = $xml->Info->PrjName;
    $retObj['parent']['num'] = 1;
    $retObj['parent']['pages'] = [];

    $p = 0;
    foreach ($xml->Pages->children() as $page) {
        $p++;
        if (!isset($retObj['parent']['pages'][$p - 1])) {
            $retObj['parent']['pages'][$p - 1] = [];
        }
        foreach ($page->Objects->children() as $object) {
            if ((string)$object->ObjType == "image") {
                $src = (string)$object->ObjFileName . '.' . (string)$object->ObjExt;
                if (isset($variableImages[$src])) {
                    $asset = [];
                    $asset['originalAsset'] = $src;
                    $asset['newAsset'] = $src;
                    $asset['type'] = "image";
                    array_push($retObj['parent']['pages'][$p - 1], $asset);
                }
            } else if ((string)$object->ObjType == "field") {
                if (isset($variableFields[(string)$object->ObjName])) {
                    $asset = [];
                    $asset['originalContents'] = (string)$object->originalContents;
                    $asset['newAsset'] = (string)$object->newContents;
                    $asset['type'] = "field";
                    $asset['fieldName'] = (string)$object->ObjName;
                    array_push($retObj['parent']['pages'][$p - 1], $asset);
                }
            }
        }
    }
    $p = 0;
    foreach ($xml->Pages->children() as $page) {
        $p++;
        if (!isset($retObj['parent']['pages'][$p - 1])) {
            $retObj['parent']['pages'][$p - 1] = [];
        }
        foreach ($page->Links->children() as $link) {
            foreach ($link->Triggers->children() as $trigger) {
                foreach ($trigger->Targets->children() as $target) {
                    $aud = (string)$target->Destination;
                    if ((string)$target->Type == "Audio" && isset($variableAudios[$aud])) {
                        $asset = [];
                        $asset['originalAsset'] = $aud . '';
                        $asset['newAsset'] = $aud . '';
                        $asset['type'] = "audio";
                        $notes = getNotes($seriesName, "Apples", $p, $aud . '');
                        foreach ($notes as $note) {
                            $asset[$note['noteType']] = $note['noteAct'];
                        }
                        array_push($retObj['parent']['pages'][$p - 1], $asset);

                    }
                }
            }
        }
    }


    $retObj['children'] = [];
    $c = 0;
    foreach ($children as &$child) {
        $c++;
        $cObj = [];
        $cObj['name'] = $child;
        $cObj['num'] = $c;
        $cObj['locked'] = getLockedByChildNameAndSeriesName($child, $seriesName);
        $cObj['status'] = getStatusByChildNameAndSeriesName($child, $seriesName);
        $cObj['pages'] = [];

        $swapsMade = getChildSwapsToMake($seriesName, $child);

        // Images
        $p = 0;
        foreach ($xml->Pages->children() as $page) {
            $p++;

            if (!isset($cObj['pages'][$p])) {
                $cObj['pages'][$p - 1] = [];
            }
            foreach ($page->Objects->children() as $object) {
                if ((string)$object->ObjType == "image") {
                    $src = (string)$object->ObjFileName . '.' . (string)$object->ObjExt;
                    if (isset($variableImages[$src])) {
                        $asset = [];
                        $asset['originalAsset'] = $src;
                        $newSrc = getNewAssetFromOldAssetSrc($src, $swapsMade);
                        if ($newSrc) {
                            $asset['newAsset'] = $newSrc;
                        } else {
                            $asset['newAsset'] = $src;
                        }
                        $asset['type'] = "image";

                        $sizeOrLoc = getSizeOrLocFromOldAssetSrc($src, $swapsMade);
                        $asset['sizeOrLoc'] = $sizeOrLoc;
                        $notes = getNotes($seriesName, $child, $p, $src);
                        foreach ($notes as $note) {
                            $asset[$note['noteType']] = $note['noteAct'];
                        }
                        array_push($cObj['pages'][$p - 1], $asset);
                    }
                } else if ((string)$object->ObjType == "field") {
                    if (isset($variableFields[(string)$object->ObjName])) {
                        $asset = [];
                        $asset['originalContents'] = (string)$object->originalContents;
                        $newSrc = getNewAssetFromOldAssetSrc((string)$object->ObjName, $swapsMade);
                        if ($newSrc) {
                            $asset['newAsset'] = $newSrc;
                        } else {
                            $asset['newAsset'] = (string)$object->originalContents;
                        }
                        $asset['type'] = "field";
                        $asset['fieldName'] = (string)$object->ObjName;
                        $notes = getNotes($seriesName, $child, $p, $asset['fieldName']);
                        foreach ($notes as $note) {
                            $asset[$note['noteType']] = $note['noteAct'];
                        }
                        array_push($cObj['pages'][$p - 1], $asset);
                    }
                }
            }
        }

        $p = 0;
        foreach ($xml->Pages->children() as $page) {
            $p++;

            if (!isset($cObj['pages'][$p - 1])) {
                $cObj['pages'][$p - 1] = [];
            }
            foreach ($page->Links->children() as $link) {
                foreach ($link->Triggers->children() as $trigger) {
                    foreach ($trigger->Targets->children() as $target) {
                        $aud = (string)$target->Destination;
                        if ((string)$target->Type == "Audio" && isset($variableAudios[$aud])) {
                            $asset = [];
                            $withExt = $aud . '';
                            $asset['originalAsset'] = $withExt;
                            $newSrc = getNewAssetFromOldAssetSrc($withExt, $swapsMade);
                            if ($newSrc) {
                                $asset['newAsset'] = trimExtension($newSrc);
                                $asset['fileModified'] = getModified($seriesName, $child, $newSrc);
                            } else {
                                $asset['newAsset'] = $withExt;
                            }
                            $asset['type'] = "audio";
                            $notes = getNotes($seriesName, $child, $p, $withExt);
                            foreach ($notes as $note) {
                                $asset[$note['noteType']] = $note['noteAct'];
                            }
                            array_push($cObj['pages'][$p - 1], $asset);
                        }
                    }
                }
            }
        }
        $retObj['children'][$c - 1] = $cObj;
    }

// Uncomment to check the return directly from the ajax request.
    /*
    print "<pre>";
    print_r(json_encode($retObj));
    print "</pre>";
    echo "<script>console.log(" . json_encode($retObj) . ");</script>";
    */
    echo json_encode($retObj);
} else {
    echo "error: seriesName undefined";
}

function getModified($seriesName, $childName, $src) {
    include_once('../../includes/dbConnect.php');
    $con = new dbConnect();
    $ret = 0;
    if ($con) {
        $sql = $con->mysqli;
        $stmt = $sql->prepare("SELECT fileModified FROM swaps WHERE refSeries = ? AND refBook = ? AND newAssetName = ?");
        $stmt->bind_param('sss', $seriesName, $childName, $src);
        $stmt->execute();
        if ($result = $stmt->get_result()) {
            /* fetch associative array */
            while ($row = $result->fetch_assoc()) {
                $tmp = [];
                $ret = $row["fileModified"];
            }
            $result->free();
        } else {
            echo "error: bad sql stmt";
        }
    } else {
        return "error: Bad sql object";
    }
    return $ret;
}

function getNewAssetFromOldAssetSrc($oldSrc, $swapsMade)
{
    for ($s = 0; $s < count($swapsMade); $s++) {
        $swap = $swapsMade[$s];
        if ($swap['originalAssetName'] == $oldSrc && isset($swap['newAssetName'])) {
            $s = count($swapsMade); // Maybe unnessisary? Return should kill everything right?? Whatever, just incase.
            return $swap['newAssetName'];
        }
    }
}

function getSizeOrLocFromOldAssetSrc($oldSrc, $swapsMade) {
    for ($s = 0; $s < count($swapsMade); $s++) {
        $swap = $swapsMade[$s];
        if ($swap['originalAssetName'] == $oldSrc && isset($swap['newAssetName'])) {
            $s = count($swapsMade); // Maybe unnessisary? Return should kill everything right?? Whatever, just incase.
            return $swap['sizeOrLoc'];
        }
    }
    return "size";
}

function getNotes($seriesName, $childName, $page, $src)
{
    include_once('../../includes/dbConnect.php');
    $con = new dbConnect();
    $ret = [];
    if ($con) {
        $sql = $con->mysqli;
        $stmt = $sql->prepare("SELECT noteType, noteAct FROM childassetnotes WHERE refSeries = ? AND refBook = ? AND refPage = ? AND originalAssetName = ?");
        $stmt->bind_param('ssss', $seriesName, $childName, $page, $src);
        $stmt->execute();
        if ($result = $stmt->get_result()) {
            /* fetch associative array */
            while ($row = $result->fetch_assoc()) {
                $tmp = [];
                $tmp['noteType'] = $row["noteType"];
                $tmp['noteAct'] = $row["noteAct"];
                array_push($ret, $tmp);
            }
            $result->free();
        } else {
            echo "error: bad sql stmt";
        }
    } else {
        return "error: Bad sql object";
    }
    return $ret;
}

function getChildSwapsToMake($seriesName, $childName)
{
    // TODO: Get abs root for includes
    include_once('../../includes/dbConnect.php');
    $con = new dbConnect();
    if ($con) {
        $sql = $con->mysqli;
        $stmt = $sql->prepare("SELECT originalAssetName, newAssetName, sizeOrLoc FROM swaps WHERE refSeries = ? AND refBook = ?");
        $stmt->bind_param('ss', $seriesName, $childName);
        $stmt->execute();
        if ($result = $stmt->get_result()) {
            /* fetch associative array */
            $swaps = array();
            while ($row = $result->fetch_assoc()) {
                $tmp = [];
                $tmp['originalAssetName'] = $row["originalAssetName"];
                $tmp['newAssetName'] = $row["newAssetName"];
                $tmp['sizeOrLoc'] = $row["sizeOrLoc"];
                array_push($swaps, $tmp);
            }
            $result->free();
            return $swaps;
        } else {
            echo "error: bad sql stmt";
        }
    } else {
        return "error: Bad sql object";
    }
}

function trimExtension($src)
{
    $arr = explode(".", $src);
    array_pop($arr);
    $str = implode(".", $arr);
    return $str;
}

function getLockedByChildNameAndSeriesName($childName, $seriesName) {
    // TODO: Get abs root for includes
    include_once('../../includes/dbConnect.php');
    $con = new dbConnect();
    if ($con) {
        $sql = $con->mysqli;
        $stmt = $sql->prepare("SELECT locked FROM children WHERE seriesName = ? AND childName = ?");
        $stmt->bind_param('ss', $seriesName, $childName);
        $stmt->execute();
        if ($result = $stmt->get_result()) {
            $row = $result->fetch_assoc();
            $ret = $row["locked"];
            return $ret;
        } else {
            echo "error: bad sql stmt";
        }
    } else {
        return "error: Bad sql object";
    }
}

function getStatusByChildNameAndSeriesName($childName, $seriesName) {
    // TODO: Get abs root for includes
    include_once('../../includes/dbConnect.php');
    $con = new dbConnect();
    if ($con) {
        $sql = $con->mysqli;
        $stmt = $sql->prepare("SELECT status FROM children WHERE seriesName = ? AND childName = ?");
        $stmt->bind_param('ss', $seriesName, $childName);
        $stmt->execute();
        if ($result = $stmt->get_result()) {
            $row = $result->fetch_assoc();
            $ret = $row["status"];
            return $ret;
        } else {
            echo "error: bad sql stmt";
        }
    } else {
        return "error: Bad sql object";
    }
}


?>


