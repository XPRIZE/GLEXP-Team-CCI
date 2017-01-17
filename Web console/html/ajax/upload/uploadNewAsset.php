<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 6/23/2016
 * Time: 2:12 PM
 */
chdir('../');
include('../../includes/loginCheck.php');
include('../php/saveXML.php');
include('../php/splitGif.php');
include('../php/outdateUnit.php');

$username = false;
if ($ret = loginCheck() === true) {
    $username = $_SESSION['username'];
    include_once('../../includes/dbConnect.php'); // not sure if already included from loginCHeck.
    $seriesName = $_GET['seriesName'];
    $assetSwapSizeOrLoc = isset($_GET["sizeOrLoc"]) ? $_GET["sizeOrLoc"] : "size";

    $type = $_GET['assetType'];
    $destLoc = false;
    if ($type == "images" || $type == "image") {
        $type = "image";
        $destLoc = "images";
    } else if ($type == "audios" || $type == "audio") {
        $type = "audio";
        $destLoc = "audio";
    }
    $oldSrc = $_GET['originalAssetName'];
    $childName = $_GET['childName'];
    $childNum = getChildNumberFromSeriesNameAndChildName($seriesName, $childName);

    if ($type == "field") {
        $newContent = $_GET['newContent'];
    } else {
        $file = $_FILES['upload'];

        $checkForConvention = explode('_', $file['name']);
        $newSrc = 'C' . $childNum . '_' . $file['name'];
        $destination = "../series/$seriesName/$destLoc/$newSrc";
        $orig_destination = "../series/$seriesName/$destLoc/orig_$newSrc";
        move_uploaded_file($file["tmp_name"], $destination);

        $oldFilename = explode(".", $oldSrc);
        if (count($oldFilename) > 1) {
            $oldFileExt = array_pop($oldFilename);
            $oldFilename = implode(".", $oldFilename);
        } else {
            $oldFileExt = false;
            $oldFilename = implode(".", $oldFilename);
        }

        $filename = explode(".", $newSrc);
        if (count($filename) > 1) {
            $fileExt = array_pop($filename);
            $filename = implode(".", $filename);
        } else {
            $fileExt = false;
            $filename = implode(".", $filename);
        }

        if ($fileExt == "gif") {
            splitGif("../series/$seriesName/$destLoc",$filename);
        }
    }

    $xml = simplexml_load_file("../series/$seriesName/$childName.xml");

    if ($type == "image") {
        foreach ($xml->Pages->children() as $page) {
            foreach ($page->Objects->children() as $object) {
                if ((string)$object->ParentSource == $oldSrc) {
                    $object->ObjFileName = $filename;
                    $object->ObjExt = $fileExt;

                    if (strtolower($object->ObjExt) == "png") {
                        $im = imagecreatefrompng($destination);
                        $object->swapHeight = imagesy($im);
                        $object->swapWidth = imagesx($im);
                        imagedestroy($im);
                    }   else if (strtolower($object->ObjExt) == "jpg" || strtolower($object->ObjExt) == "jpeg") {
                        $data = getimagesize($destination);
                        $object->swapHeight = $data[1];
                        $object->swapWidth = $data[0];
                    }
                    $object->swapSizeOrLoc = $assetSwapSizeOrLoc;



                    /*
                    // Resizes image with additional transparency.
                    $parentHeight = 100;
                    $parentWidth = 200;

                    $im = imagecreatefrompng($destination);
                    $uploadHeight = imagesy($im);
                    $uploadWidth = imagesx($im);

                    // echo "Fit the uploaded image (h:$uploadHeight, w:$uploadWidth) into image (h:$parentHeight, w:$parentWidth).<br>";
                    $heightSizeDown = $uploadHeight / $parentHeight;
                    if ($uploadWidth / $heightSizeDown > $parentWidth) {
                        $widthSizeDown = $uploadWidth / $parentWidth;
                        $newHeight = $uploadHeight / $widthSizeDown;
                        $newWidth = $parentWidth;
                    } else {
                        $newHeight = $parentHeight;
                        $newWidth = $uploadWidth / $heightSizeDown;
                    }
                    // echo "First, size the image to (h:$newHeight, w:$newWidth)</br>";
                    $leftOffset = ($parentWidth - $newWidth) / 2;
                    $topOffset = ($parentHeight - $newHeight) / 2;
                    // echo "Then, offset the image (t:$topOffset, l:$leftOffset)</br>";

                    $newImg = imagecreatetruecolor($parentWidth, $parentHeight);
                    imagealphablending($newImg, false);
                    imagesavealpha($newImg, true);
                    $transparent = imagecolorallocatealpha($newImg, 255, 255, 255, 127);
                    imagefilledrectangle($newImg, 0, 0, $parentWidth, $parentHeight, $transparent);

                    imagecopyresampled($newImg, $im, $leftOffset, $topOffset, 0, 0,
                        $newWidth, $newHeight, $uploadWidth, $uploadHeight);

                    imagepng($newImg, $destination, 9);
                    imagepng($newImg, $orig_destination, 9);
                    */
                }
            }
        }
    } else if ($type == "audio") {
        foreach ($xml->Pages->children() as $page) {
            foreach ($page->Links->children() as $link) {
                foreach ($link->Triggers->children() as $trigger) {
                    foreach ($trigger->Targets->children() as $target) {
                        if ($target->ParentSource == $oldFilename) {
                            $target->Destination = $filename;
                        }
                    }
                }
            }
        }
    } else if ($type == "field") {
        foreach ($xml->Pages->children() as $page) {
            foreach ($page->Objects->children() as $object) {
                if ((string)$object->ObjName == $oldSrc) {
                    $object->newContents = $newContent;
                    $object->FldContentsEncoded = $newContent;
                }
            }
        }
    }

    saveXML($xml, "../series/$seriesName/$childName.xml");
    if ($type == "field") {
        addSwapToDB($seriesName, $childName, $oldSrc, $newContent, $username);
        echo 'done';
    } else {
        addSwapToDB($seriesName, $childName, $oldSrc, $newSrc, $username);
        $newSrcComplete = "";
        if ($type == "image") {
            $newSrcComplete = "images";
        } else if ($type == "audio") {
            $newSrcComplete = "audio";
        }
        $newSrcComplete = $newSrcComplete . '/' . $newSrc;
        echo '{"status":"server","src":"' . $newSrcComplete . '"}';
    }


} else {
    echo "{error:'$ret'}";
}

function addSwapToDB($seriesName, $childName, $oldSrc, $newSrc, $username)
{
    $pass = true;
    include_once('../../includes/dbConnect.php');
    $con = new dbConnect();
    $sql = $con->mysqli;
    // Delete old swaps
    $sqlObj = $sql->prepare("DELETE FROM swaps WHERE refSeries = ? AND refBook = ? AND originalAssetName = ?");
    if ($sqlObj) {
        $sqlObj->bind_param('sss', $seriesName, $childName, $oldSrc);
        $sqlObj->execute();
    }   else    {
        $pass = false;
    }

    // Save most recent swap
    $queryStr = "INSERT INTO swaps " .
        "(refSeries, refBook, originalAssetName, newAssetName, username) " .
        "VALUES (?, ?, ?, ?, ?)";
    $sqlObj = $sql->prepare($queryStr);
    if ($sqlObj) {
        $sqlObj->bind_param('sssss', $seriesName, $childName, $oldSrc, $newSrc, $username);
        $sqlObj->execute();
    } else {
        echo "error: bad sql obj";
        $pass = false;
    }

    outdateBySeriesAndChild($seriesName, $childName);

    if ($pass) {
        return true;
    }   else    {
        return false;
    }

    // Done!

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