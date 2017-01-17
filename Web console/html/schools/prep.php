<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function writeOut($what) {
    echo $what . "</br>";
    flush();
    ob_flush();
}

$school = $_GET['school'];
unset($_GET['school']);
require('../php/checkSchoolNames.php');
require("../../includes/dbConnect.php");
require("../ajax/get/getSubjects.php");
require("../ajax/get/getLevels.php");
require("../ajax/get/getUnits.php");
require("../ajax/get/getTutorials.php");
require("../php/rrmdir.php");

$totZipSize = 0;
$schoolObj = [];
$schoolObj['name'] = $school;
$schoolObj['subjects'] = [];
$schoolObj['subjects'] = getSubjects($school);
for ($s = 0; $s < count($schoolObj['subjects']); $s++) {
    $subName = $schoolObj['subjects'][$s]['name'];

    $levels = getLevels($school, $subName);
    $schoolObj['subjects'][$s]['levels'] = $levels;
    for ($l = 0; $l < count($schoolObj['subjects'][$s]['levels']); $l++) {
	$lvlName = $schoolObj['subjects'][$s]['levels'][$l]['name'];
	$units = getUnits($school, $subName, $lvlName);
	$schoolObj['subjects'][$s]['levels'][$l] = [];
	$schoolObj['subjects'][$s]['levels'][$l]['name'] = $lvlName;
	$schoolObj['subjects'][$s]['levels'][$l]['units'] = $units;
    }
}

$schoolObj['tutorials'] = [];
$tutorials = getTutorial($school);
if ($tutorials) {
    for ($t = 0; $t < count($tutorials); $t++) {
	$tutorial = $tutorials[$t];
	$schoolObj['tutorials'][$t] = [];
	$schoolObj['tutorials'][$t]['name'] = $tutorial['name'];
	$schoolObj['tutorials'][$t]['type'] = $tutorial['tutorialType'];
	$schoolObj['tutorials'][$t]['subjectID'] = $tutorial['subjectID'];
	$schoolObj['tutorials'][$t]['status'] = 'incomplete';
    }
}



writeOut("School object built from DB");

if (true) {
    $zipLoc = "../downloads/$school" . "_zip";
    if (is_dir($zipLoc)) {
	chdir("../");
	rrmdir("downloads/$school" . "_zip");
	chdir("schools");
    }
    mkdir($zipLoc);

    $filesToZip = [];
    $foldersToZip = [];

    require("../php/saveXML.php");
    $xml = new SimpleXMLElement(file_get_contents("$school/school.xml"));
    array_push($filesToZip, "school.xml");

    /*
      if ($xml->scrapbook->icon) {
      array_push($filesToZip, "icons/" . (string) $xml->scrapbook->icon);
      }
      if ($xml->tutorial->icon) {
      array_push($filesToZip, "icons/" . (string) $xml->tutorial->icon);
      }
     */
    if ($xml->avatar) {
	array_push($filesToZip, "icons/" . (string) $xml->avatar);
    }
    if ($xml->schoolBG) {
	array_push($filesToZip, "icons/" . (string) $xml->schoolBG);
    }

    writeOut("Starting zip");

    $downloadManifest = "<files>";


    if ($xml->tutorials) {
	unset($xml->tutorials);
    }
    if (count($schoolObj['tutorials'])) {
	$xml->addChild("tutorials");
    }
    $subjectsWithTutorials = [];
    for ($t = 0; $t < count($schoolObj['tutorials']); $t++) {
	// Add tutorial to XML
	$obj = $schoolObj['tutorials'][$t];
	$cur = $xml->tutorials->addChild("tutorial");
	$tutName = $obj['name'];
	$cur->addChild("name", $tutName);
	$cur->addChild("type", $obj['type']);
	$cur->addChild("subID", $obj['subjectID']);
	$cur->addChild("status", 'incomplete');
	if (file_exists("$school/tutorials/$tutName/icons/icon.png")) {
	    $cur->addChild("icon", 'icon.png');
	}

	// Key for later use (see if there are mandatory subject tutorials)
	$subjectsWithTutorials[$obj['subjectID']] = true;

	// Create the zip file.
	copy("../html/schoolHouseBookTemplate.html", "$school/tutorials/$tutName/index.html");
	$zipName = "$tutName" . "_Tutorial";
	writeOut("Adding $zipName");
	rename("$school/tutorials/$tutName", "$school/tutorials/$zipName");
	makeZip($zipLoc, $zipName, "$school/tutorials/", [], [$zipName]);
	rename("$school/tutorials/$zipName", "$school/tutorials/$tutName");
	$zipSize = filesize("$zipLoc/$zipName.zip");
	$downloadManifest = $downloadManifest . "<file><name>$zipName</name><size>$zipSize</size></file>";
	$totZipSize += $zipSize;
    }

    foreach ($xml->subjects->children() as $subject) {
	for ($so = 0; $so < count($schoolObj['subjects']); $so++) {
	    $subName = $schoolObj['subjects'][$so]['name'];
	    if ((string) $subject->name == $subName) {
		$subID = $schoolObj['subjects'][$so]["ID"];
		$subject->ID = $subID;
		if ($subject->icon) {
		    array_push($filesToZip, "$subName/icons/" . (string) $subject->icon);
		}
		if ($subject->tutorial) {
		    unset($subject->tutorial);
		}
		/*
		  if (isset($schoolObj['subjects'][$so]['tutorial'])) {
		  $tut = $subject->addChild("tutorial");
		  $tut->addChild("name", $schoolObj['subjects'][$so]['tutorial']['name']);
		  $tut->addChild("status", "incomplete");
		  copy("../html/schoolHouseBookTemplate.html", "$school/$subName/Tutorial/index.html");
		  $zipName = "$subName" . "_Tutorial";
		  writeOut("Adding $zipName");
		  rename("$school/$subName/Tutorial", "$school/$subName/$zipName");
		  makeZip($zipLoc, $zipName, "$school/$subName/", [], [$zipName]);
		  rename("$school/$subName/$zipName", "$school/$subName/Tutorial");
		  $zipSize = filesize("$zipLoc/$zipName.zip");
		  $downloadManifest = $downloadManifest . "<file><name>$zipName</name><size>$zipSize</size></file>";
		  $totZipSize += $zipSize;
		  }
		 */

		// Clear node if found
		if ($subject->levels) {
		    unset($subject->levels);
		}
		$subject->addChild("levels", "");
		for ($l = 0; $l < count($schoolObj['subjects'][$so]['levels']); $l++) {

		    $levelObj = $schoolObj['subjects'][$so]['levels'][$l];
		    $xmlLevel = $subject->levels->addChild("level");
		    $levelName = $levelObj['name'];
		    $xmlLevel->addChild("name", $levelName);
		    if ($l == 0) {
			if (isset($subjectsWithTutorials[$subID])) {
			    $xmlLevel->addChild("status", "locked"); // tutorial unlocks first level
			} else {
			    $xmlLevel->addChild("status", "unlocked");
			}
		    } else {
			$xmlLevel->addChild("status", "locked");
		    }
		    $xmlUnits = $xmlLevel->addChild("units");
		    $xmlGames = $xmlLevel->addChild("games");
		    for ($u = 0; $u < count($levelObj['units']); $u++) {

			$unitObj = $levelObj['units'][$u];
			$unitName = $unitObj['name'];
			if (count(explode(" ", $unitName)) == 4 && explode(" ", $unitName)[0] == "Game" && explode(" ", $unitName)[2] == "dif") {
			    $xmlGame = $xmlGames->addChild("game");
			    $xmlGame->addChild("name", $unitName);
			    $gameNum = explode(" ", $unitName)[1];
			    $icon = "Level_" . $levelName . "_Game_" . $gameNum . ".png";
			    $xmlGame->addChild("icon", $icon);
			    array_push($filesToZip, "$subName/icons/$icon");
			} else {
			    $xmlUnit = $xmlUnits->addChild("unit");
			    $xmlUnit->addChild("name", $unitName);
			    $xmlUnit->addChild("status", "incomplete");
			}

			copy("../html/schoolHouseBookTemplate.html", "$school/$subName/$levelName/$unitName/index.html");
			$zipName = "$subName" . "_" . "$levelName" . "_" . "$unitName";
			writeOut("Adding $zipName");
			rename("$school/$subName/$levelName/$unitName", "$school/$subName/$levelName/$zipName");
			makeZip($zipLoc, $zipName, "$school/$subName/$levelName", [], [$zipName]);
			rename("$school/$subName/$levelName/$zipName", "$school/$subName/$levelName/$unitName");
			$zipSize = filesize("$zipLoc/$zipName.zip");
			$downloadManifest = $downloadManifest . "<file><name>$zipName</name><size>$zipSize</size></file>";
			$totZipSize += $zipSize;

			/*
			  copy("../html/schoolHouseBookTemplate.html", "$school/$subName/$levelName/$unitName/index.html");
			  array_push($filesToZip, "$subName/$levelName/$unitName/index.html");
			  array_push($filesToZip, "$subName/$levelName/$unitName/MainXML.xml");
			  array_push($foldersToZip, "$subName/$levelName/$unitName/audio");
			  array_push($foldersToZip, "$subName/$levelName/$unitName/images");
			 */
		    }
		}
		// dump levels
	    }
	}
    }



    saveXML($xml, "$school/school.xml");
    writeOut("XML saved");

    writeOut("Creating basic school structure");
    makeZip($zipLoc, "schoolStructure", $school, $filesToZip, $foldersToZip);
    $zipSize = filesize("$zipLoc/schoolStructure.zip");
    $downloadManifest = $downloadManifest . "<file><name>schoolStructure</name><size>$zipSize</size></file>";
    $totZipSize += $zipSize;

    writeOut("Adding book scripts");
    makeZip($zipLoc, "bookIncludes", "../bookDependencies/production/R16", [], ["script", "presets", "fonts"]);
    $zipSize = filesize("$zipLoc/bookIncludes.zip");
    $downloadManifest = $downloadManifest . "<file><name>bookIncludes</name><size>$zipSize</size></file>";
    $totZipSize += $zipSize;
    $downloadManifest = $downloadManifest . "</files>";
    file_put_contents("$zipLoc/manifest.xml", $downloadManifest);
    writeOut("Manifest saved");

    if (is_file("../downloads/" . $school . "_version")) {
	$version = floatval(explode("|", file_get_contents("../downloads/" . $school . "_version"))[0]);
    } else {
	$version = 0;
    }
    $version += 0.01;
    file_put_contents("../downloads/" . $school . "_version", "$version|$totZipSize");
    $xml->version = $version;
    writeOut("Version incremented to $version");
}

function makeZip($zipLoc, $zipName, $pullLoc, $files, $folers) {
    set_time_limit(120); // 2 minutes per zip, should be enough.
    $zip = new ZipArchive();
    $zipFile = "$zipLoc/$zipName.zip";

    if ($zip->open($zipFile, ZipArchive::CREATE) !== TRUE) {
	exit("cannot open <$zipFile>\n");
    }
    // Line up all files from folder requests individualls.
    $zipFileList = [];
    for ($f = 0; $f < count($folers); $f++) {
	$folder = $folers[$f];
	$zipFileList = array_merge($zipFileList, filesInFolder("$pullLoc/$folder", "$folder/"));
    }

    // Add individual file requests
    for ($f = 0; $f < count($files); $f++) {
	$file = $files[$f];
	// $zip->addFile("$pullLoc/$file", "$file");
	array_push($zipFileList, ["$pullLoc/$file", $file]);
    }

    for ($f = 0; $f < count($zipFileList); $f++) {
	$zip->addFile($zipFileList[$f][0], $zipFileList[$f][1]);
	// writeOut("Zipping " . $zipFileList[$f][1]);
    }

    /*
      echo "<pre>";
      print_r($zipFileList);
      echo "</pre>";
     * */
    //
    // $zip->addFile($fsName, $fileName);

    $zip->close();
}

function filesInFolder($folder, $prefix) {
    // writeOut("Zipping files in $folder");
    $files = [];
    $dir = new DirectoryIterator($folder);
    foreach ($dir as $fileinfo) {
	if (!$fileinfo->isDot()) {
	    // $fileinfo->getPathName()
	    $fsName = $fileinfo->getPathName();
	    $fileName = $fileinfo->getFilename();
	    if (is_dir($fsName)) {
		// writeOut("Recursive adding $fsName");
		$files = array_merge($files, filesInFolder($fsName, "$prefix" . "$fileName/"));
	    } else {
		// writeOut("Adding $fsName");
		array_push($files, [$fsName, "$prefix" . "$fileName"]);
		// writeOut("Zipping $fileName");
	    }
	}
    }
    return $files;
}

writeOut("Done");
echo "</br></br></br><hr>";
writeOut("To test, please launch your android school house app ");
?>