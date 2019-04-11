<?php

/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 6/18/2016
 * Time: 3:03 PM
 */
// Main
// tester

function unpackParentZip($seriesName) {
    chdir("../series/$seriesName/");
    $parent = new ZipArchive;
    $testing = false;
    if ($testing) {
        rename("Parent.zip", "NewParent.zip");
    }
    if ($parent->open('NewParent.zip') === TRUE) {
        $date = new DateTime();
        $stamp = $date->getTimestamp();
        copy("NewParent.zip", "../../zips/$seriesName" . "_parent_" . $stamp . ".zip");
        $recentBackup = "../../zips/$seriesName" . "_parent.zip";
        if (is_file($recentBackup)) {
            unlink($recentBackup);
        }
        copy("NewParent.zip", $recentBackup);

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
        $dirMade = false;
        $files = scandir(getCWD());
        if (is_dir('images')) {
            recurse_copy("images", "oldImages");
        }
        if (is_dir('videos')) {
            recurse_copy("videos", "oldVideos");
        }
        if (is_dir('audio')) {
            recurse_copy("audio", "oldAudio");
        }
        foreach ($files as &$file) {
            // TODO: put all the "don't move" files into a "don't move" array, check the arr instead, reduce this 10 foot line.
            if ($file == "." || $file == ".." || $file == "previousVersions" || $file == "edit.php" || $file == "NewParent.zip" || $file == "selectSeries.php" || $file == "index.html" || $file == "oldImages" || $file == "oldAudio"
            ) {
                
            } else {
                if (!$dirMade) {
                    $dirMade = true;
                    mkdir("previousVersions/$lastVersion");
                }
                rename($file, "previousVersions/$lastVersion/" . $file);
            }
        }
        $parent->extractTo(getCWD());
        $parent->close();
        rename("NewParent.zip", "Parent.zip");
        if (!is_dir("audio")) {
            mkdir("audio");
        }
        if (!is_dir("images")) {
            mkdir("images");
        }
        if (!is_dir("images/gifFrames")) {
            mkdir("images/gifFrames");
            chmod("images/gifFrames", 0777);
        }
        // TODO: Consider a chmod? Don't want the parent zip just... lying around on the web.
        // TODO: Consider a chmod for the main file as well? Could have some livecode code in there... Just a thought.
        // TODO: Consider a chmod for the previousVersions?????? SET ALL THE PERMISSIONS!!
        // Save original XML for ray's future rebuild.
        copy("MainXML.xml", "OriginalParentXML.xml");
        rename("MainXML.xml", "Parent.xml");
        // Open XML, delete anything we don't need. (spring cleaning)
        $xml = simplexml_load_file("Parent.xml");
        $xml->preserveWhiteSpace = false;
        $xml->formatOutput = true;
        // Man I am so freaking smart. I don't have to add important info to the array, because new info nodes will be automatically included.
        $uselessInfo = ["ProjectIds", "LastUsedImgFolderPath", "AudioFileTimes", "MobileScaling",
            "TabClosedOn", "ProjectSizeInKilobytes", "BookPoints", "CompositePrepared", "LastMouseLoc",
            "ProjectName", "CurrentRect", "MobileOrientations", "LastChosenScreenRestrictions", "ProjectVersion",
            "LastTopLeft", "FrameBackgroundColor", /* "BrowserBackgroundColor", */
            "ProjectCategory", "LockWindowSize", "OrigTopLeft", "SameMouseLocTimeToInterruptThreshold", "PrjRect", "LastPageSpread"];
        foreach ($uselessInfo as &$type) {
            if ($xml->Info->$type) {
                unset($xml->Info->$type);
            }
        }

        // Loop through every image in the parent XML, rename the source to P_$src
        // AND ALSO, do stuff with fields.
        foreach ($xml->Pages->children() as $page) {
            foreach ($page->Objects->children() as $object) {
                if ((string) $object->ObjType == "image") {
                    $src = (string) $object->ObjFileName;
                    $object->ObjFileName = "P_$src";
                    if (isset($object->ObjImageSequenceFolder)) {
                        $seqSrc = (string) $object->ObjImageSequenceFolder;
                        $object->ObjImageSequenceFolder = "P_$seqSrc";
                    }
                } else if ((string) $object->ObjType == "video") {
                    $src = (string) $object->ObjName;
                    $ext = (string) $object->ObjExt;
                    // $object->ObjName = "P_$src";
                    $object->ObjFileName = "P_$src" . ".$ext";
                } else if ((string) $object->ObjType == "field") {
                    $object->originalContents = (string) $object->FldContentsEncoded;
                    $object->newContents = (string) $object->FldContentsEncoded;
                }
            }
        }
        // Same for aud
        foreach ($xml->Pages->children() as $page) {
            foreach ($page->Links->children() as $link) {
                foreach ($link->Triggers->children() as $trigger) {
                    foreach ($trigger->Targets->children() as $target) {
                        if ($target->Type == "Audio") {
                            $aud = (string) $target->Destination;
                            $functionCheck1 = explode("?choose(", $aud);
                            $functionCheck2 = explode("?chooseAndRemove(", $aud);
                            if (count($functionCheck1) > 1 || count($functionCheck2) > 1) {

                                // This takes care of ?choose(aud,aud,aud)?
                                $audArr = [];
                                $newStr = (count($functionCheck1) > 1) ? "?choose(" : "?chooseAndRemove(";
                                $audStr = (count($functionCheck1) > 1) ? $functionCheck1[1] : $functionCheck2[1];
                                $audStr = explode(")?", $audStr);
                                $audStr = $audStr[0];
                                $audArr = explode(",", $audStr);
                                for ($a = 0; $a < count($audArr); $a++) {
                                    $newStr = $newStr . "P_" . $audArr[$a] . ",";
                                }
                                $newStr = rtrim($newStr, ",");
                                $newStr = $newStr . ")?";
                                $target->Destination = $newStr;
                            } else {
                                $target->Destination = "P_$aud";
                            }
                        }
                    }
                }
            }
        }
        // Same for assets
        foreach ($xml->Assets->children() as $asset) {
            if (strtolower((string) $asset->Type) == "field") {
                // Field sources don't need the prefix.
            } else {
                $asset->Source = "P_" . $asset->Source;
            }
        }

        // Loop through every image in the file system, rename to P_$src
        $images = scandir('images');
        foreach ($images as &$image) {
            if ($image != "." && $image != ".." && $image != "gifFrames") {
                rename("images/$image", "images/P_$image");
                $fileName = explode(".", "P_$image");
                $fileExt = array_pop($fileName);
                $fileName = implode(".", $fileName);
                if ($fileExt == "gif") {
                    splitGif("images/", $fileName);
                }
            }
        }
        $videos = scandir('videos');
        foreach ($videos as &$video) {
            if ($video != "." && $video != ".." && $video != "gifFrames") {
                rename("videos/$video", "videos/P_$video");
            }
        }
        // Same for aud
        $audios = scandir('audio');
        foreach ($audios as &$audio) {
            if ($audio != "." && $audio != "..") {
                rename("audio/$audio", "audio/P_$audio");
            }
        }

        // Loop through every image in the oldImages/gifFrames folder, move if not duplicated by parent images/gifFrames in current images folder
        if (is_dir('oldImages/gifFrames')) {
            $oldImages = scandir('oldImages/gifFrames');
            foreach ($oldImages as &$oldImage) {
                if (!file_exists("images/gifFrames/$oldImage") && $oldImage != "." && $oldImage != "..") {
                    rename("oldImages/gifFrames/$oldImage", "images/gifFrames/$oldImage");
                }
            }
            // oldImages/gifFrames now comtaines all the duplicate parent assets from the last go, no longer needed.
            rmdir('oldImages/gifFrames');
        }
        // Loop through every image in the oldImages folder, move if not duplicated by parent images in current images folder
        if (is_dir('oldImages')) {
            $oldImages = scandir('oldImages');
            foreach ($oldImages as &$oldImage) {
                if (!file_exists("images/$oldImage") && $oldImage != "." && $oldImage != ".." && $oldImage != "gifFrames") {
                    rename("oldImages/$oldImage", "images/$oldImage");
                }
            }
            // oldImages and oldAudio now comtaines all the duplicate parent assets from the last go, no longer needed.
            rmdir('oldImages');
        }
        if (is_dir('oldVideos')) {
            $oldVideos = scandir('oldVideos');
            foreach ($oldVideos as &$oldVideo) {
                if (!file_exists("videos/$$oldVideo") && $oldVideo != "." && $oldVideo != "..") {
                    rename("oldVideos/$oldVideo", "videos/$oldVideo");
                }
            }
            rmdir('oldVideos');
        }
        // Same for aud
        if (is_dir('oldAudio')) {
            $oldAudios = scandir('oldAudio');
            foreach ($oldAudios as &$oldAudio) {
                if (!file_exists("audio/$oldAudio") && $oldAudio != "." && $oldAudio != "..") {
                    rename("oldAudio/$oldAudio", "audio/$oldAudio");
                }
            }
            // oldImages and oldAudio now comtaines all the duplicate parent assets from the last go, no longer needed.
            rmdir('oldAudio');
        }

        $variableImages = [];
        $variableVideos = [];
        $variableVideosNoExt = [];
        $variableAudios = [];
        $i = 1;
        // Get all variable assets (images and audios)
        foreach ($xml->Assets->children() as $child) {
            if (strtolower((string) $child->FixedOrVariable) == "variable") {
                if ((string) $child->Type == "Image") {
                    $variableImages[(string) $child->Source] = $i;
                    $i++;
                } else if ((string) $child->Type == "Video") {
                    $variableVideos[(string) $child->Source] = $i;
                    $variableVideosNoExt[trimExtension((string) $child->Source)] = $i;
                    $i++;
                } else if ((string) $child->Type == "Audio") {
                    $fileName = trimExtension((string) $child->Source);
                    $variableAudios[$fileName] = $i;
                    $i++;
                }
            }
        }

        // Set Source and ParentSource for images/videos
        foreach ($xml->Pages->children() as $page) {
            foreach ($page->Objects->children() as $object) {

                if ((string) $object->ObjType == "video") {
                    $src = (string) $object->ObjFileName;
                    if (isset($variableVideos[$src])) {
                        if ($object->Source[0] == null) {
                            $object->addChild("Source", $src);
                        } else {
                            $object->Source = $src;
                        }
                        if ($object->ParentSource[0] == null) {
                            $object->addChild("ParentSource", $src);
                        } else {
                            $object->ParentSource = $src;
                        }
                    }
                } else {
                    $src = (string) $object->ObjFileName . '.' . (string) $object->ObjExt;
                    if (isset($variableImages[$src])) {
                        if ($object->Source[0] == null) {
                            $object->addChild("Source", $src);
                        } else {
                            $object->Source = $src;
                        }
                        if ($object->ParentSource[0] == null) {
                            $object->addChild("ParentSource", $src);
                        } else {
                            $object->ParentSource = $src;
                        }
                    }
                }
            }
        }
        // set ParentSource fOr audios
        foreach ($xml->Pages->children() as $page) {
            foreach ($page->Links->children() as $link) {
                foreach ($link->Triggers->children() as $trigger) {
                    foreach ($trigger->Targets->children() as $target) {
                        $aud = (string) $target->Destination;
                        if ((string) $target->Type == "Audio" && isset($variableAudios[$aud])) {
                            if ($target->ParentSource[0] == null) {
                                $target->addChild("ParentSource", "$aud");
                            } else {
                                $target->ParentSource = $aud;
                            }
                        }
                    }
                }
            }
        }

        saveXML($xml, "Parent.xml");


        $children = getChildArr($seriesName);

        if (count($children) == 0) {
            // No children
        } else {
            foreach ($children as &$child) {
                // echo $child['name'] . '</br>';
                copy("Parent.xml", $child['name'] . '.xml');
                $phpLoc = $child["name"] . '.php';
                file_put_contents($child['name'] . '.html', "" .
                        "<html>" .
                        "<head lang='en'><meta http-equiv='refresh' content='0; URL=$phpLoc /></head>" .
                        "</html>");
                file_put_contents($phpLoc, file_get_contents("../../php/templates/childIndex.php"));
                copy("Parent.xml", $child['name'] . ".xml");
                $childXML = simplexml_load_file($child['name'] . ".xml");
                $childXML->preserveWhiteSpace = false;
                $childXML->formatOutput = true;

                // Copy over child name to XML.
                $childXML->Info->PrjName = $child['name'];
                $childXML->Info->PrjNameLong = $child['name'];

                $swapsToMake = getChildSwapsToMake($seriesName, $child['name']);
                // Make swaps (auds and imgs)
                foreach ($swapsToMake as &$swap) {
                    $orig = $swap['originalAssetName'];
                    $new = $swap['newAssetName'];
                    // echo "$orig -> $new </br>";
                    $originalFound = false;
                    $originalType = "";
                    foreach ($childXML->Assets->children() as $asset) {
                        if (trimExtension($asset->Source) == trimExtension($orig) && !$originalFound) {
                            if ((string) $asset->Type == "Image" && $asset->Source == $orig) {
                                $originalFound = true;
                                $originalType = (string) $asset->Type;
                            } else if ((string) $asset->Type == "Audio") {
                                $originalFound = true;
                                $originalType = (string) $asset->Type;
                            } else if ((string) $asset->Type == "Field") {
                                $originalFound = true;
                                $originalType = "Field";
                            } else if ((string) $asset->Type == "Video") {
                                $originalFound = true;
                                $originalType = "Video";
                            }
                        }
                    }
                    // Why not loop through images first? Assets are a quicker loop, so it saves some time to check there first.
                    if ($originalFound) {
                        if ($originalType == "Image") {
                            $fileName = explode(".", $new);
                            $fileExt = array_pop($fileName);
                            $fileName = implode(".", $fileName);
                            $origName = explode(".", $orig);
                            $origExt = array_pop($origName);
                            $origName = implode(".", $origName);
                            $dims = getDimensions("images/$new");
                            $swapWidth = $dims["width"];
                            $swapHeight = $dims["height"];
                            $sizeOrLoc = $swap["sizeOrLoc"];

                            foreach ($childXML->Pages->children() as $page) {
                                foreach ($page->Objects->children() as $object) {
                                    if ($object->ObjFileName == $origName && $object->ObjExt == $origExt) {
                                        $object->ObjFileName = $fileName;
                                        $object->ObjExt = $fileExt;
                                        $object->swapWidth = $swapWidth;
                                        $object->swapHeight = $swapHeight;
                                        $object->swapSizeOrLoc = $sizeOrLoc;
                                    }
                                }
                            }
                        } else if ($originalType == "Audio") {
                            $origName = trimExtension($orig);
                            foreach ($childXML->Pages->children() as $page) {
                                foreach ($page->Links->children() as $link) {
                                    foreach ($link->Triggers->children() as $trigger) {
                                        foreach ($trigger->Targets->children() as $target) {
                                            if ($target->Destination == $origName && $target->Type == "Audio") {
                                                $target->Destination = trimExtension($new);
                                            }
                                        }
                                    }
                                }
                            }
                        } else if ($originalType == "Field") {
                            foreach ($childXML->Pages->children() as $page) {
                                foreach ($page->Objects->children() as $object) {
                                    if ($object->ObjName == $orig) {
                                        $object->FldContentsEncoded = $new;
                                    }
                                }
                            }
                        } else if ($originalType == "Video") {
                            foreach ($childXML->Pages->children() as $page) {
                                foreach ($page->Objects->children() as $object) {
                                    if ($object->ParentSource == $orig) {
                                        $object->ObjFileName = $new;
                                        $object->Source = $new;
                                    }
                                }
                            }
                        }
                    }
                }

                saveXML($childXML, $child['name'] . '.xml');
            }
        }

        file_put_contents("selectSeries.php", file_get_contents("../../php/templates/seriesIndex.php"));
        file_put_contents("swap.php", file_get_contents("../../php/templates/swap.php"));

        return true;
    } else {
        return "error: Uploaded file in incorrect format, please upload only zips exported from the Pubbly design tools";
    }
}

// Helpers

function recurse_copy($src, $dst) {
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

function getChildArr($seriesName) {
    // TODO: Get abs root for includes
    include_once('../../../includes/dbConnect.php');
    $con = new dbConnect();
    if ($con) {
        $sql = $con->mysqli;
        $stmt = $sql->prepare("SELECT * FROM children WHERE seriesName = ?");
        $stmt->bind_param('s', $seriesName);
        $stmt->execute();
        if ($result = $stmt->get_result()) {
            /* fetch associative array */
            $children = array();
            while ($row = $result->fetch_assoc()) {
                $tmp = [];
                $tmp['name'] = $row["childName"];
                array_push($children, $tmp);
            }
            $result->free();
            return $children;
        } else {
            echo "error: bad sql stmt";
        }
    } else {
        return "error: Bad sql object";
    }
}

function getChildSwapsToMake($seriesName, $childName) {
    // TODO: Get abs root for includes
    include_once('../../../includes/dbConnect.php');
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

function trimExtension($src) {
    $arr = explode(".", $src);
    if (count($arr) == 1) {
        return $src;
    } else {
        array_pop($arr);
        $str = implode(".", $arr);
        return $str;
    }
}

function getDimensions($loc) {
    $tmp = explode(".", $loc);
    $ext = strtolower($tmp[count($tmp) - 1]);
    $ret = [];
    if ($ext == "png") {
        $im = imagecreatefrompng($loc);
        $ret['height'] = imagesy($im);
        $ret['width'] = imagesx($im);
        imagedestroy($im);
    } else if ($ext == "jpg" || $ext == "jpeg") {
        $data = getimagesize($loc);
        $ret['height'] = $data[1];
        $ret['width'] = $data[0];
    } else {
        $ret = false;
    }
    return $ret;
}

?>
