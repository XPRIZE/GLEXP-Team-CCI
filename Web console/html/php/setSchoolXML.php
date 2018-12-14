<?php

/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 11/9/2016
 * Time: 8:37 AM
 */
require("../php/saveXML.php");

// setSubjectIcon("Xprize", "Reading", "readingIcon.png", "");
function setSubjectIcon($schoolName, $subjectName, $icon, $state) {
    $xmlLoc = "../schools/$schoolName/school.xml";
    $nodes = returnXmlAndSubjectNode($schoolName, $subjectName);
    $xml = $nodes[0];
    $subjectNode = $nodes[1];
    // Set icon
    if ($state == "hover") {
	$subjectNode->iconHover = $icon;
    } else if ($state == "down") {
	$subjectNode->iconDown = $icon;
    } else {
	$subjectNode->icon = $icon;
    }
    saveXML($xml, $xmlLoc);
}

function setSchoolTranslation($schoolName, $orig, $translation) {
    $xmlLoc = "../schools/$schoolName/school.xml";
    $xml = returnXmlNode($schoolName);
    if (!$xml->translations) {
	$xml->addChild("translations");
    }
    if (!$xml->translations->$orig) {
	$xml->translations->addChild($orig, $translation);
    } else {
	$xml->translations->$orig = $translation;
    }
    saveXML($xml, $xmlLoc);
}

function setSubjectColor($schoolName, $subjectName, $color) {
    $color = "#" . $color;
    $xmlLoc = "../schools/$schoolName/school.xml";
    $nodes = returnXmlAndSubjectNode($schoolName, $subjectName);
    $xml = $nodes[0];
    $subjectNode = $nodes[1];
    // Set icon
    if (!$subjectNode->color) {
	$subjectNode->addChild("color", $color);
    } else {
	$subjectNode->color = $color;
    }
    saveXML($xml, $xmlLoc);
}

// setSubjectLoc("Xprize", "Reading", "2", "1");
function setSubjectLoc($schoolName, $subjectName, $row, $col) {
    $xmlLoc = "../schools/$schoolName/school.xml";
    $nodes = returnXmlAndSubjectNode($schoolName, $subjectName);
    $xml = $nodes[0];
    $subjectNode = $nodes[1];
    if (!$subjectNode->row) {
	$subjectNode->addChild("row");
    }
    if (!$subjectNode->col) {
	$subjectNode->addChild("col");
    }
    $subjectNode->row = $row;
    $subjectNode->col = $col;
    saveXML($xml, $xmlLoc);
}

// setSchoolRowsAndCols("Xprize",3,3);
function setSchoolRowsAndCols($schoolName, $rows, $cols) {
    $xmlLoc = "../schools/$schoolName/school.xml";
    $xml = returnXmlNode($schoolName);
    $xml->rowCount = $rows;
    $xml->colCount = $cols;
    saveXML($xml, $xmlLoc);
}

// setDefaultAvatar("Xprize","tabletBorder.png");
function setDefaultAvatar($schoolName, $filename) {
    $xml = returnXmlNode($schoolName);
    $xml->avatar = $filename;
    saveXML($xml, "../schools/$schoolName/school.xml");
}

// setDefaultBG("Xprize","safari.png");
function setDefaultBG($schoolName, $filename) {
    $xml = returnXmlNode($schoolName);
    $xml->schoolBG = $filename;
    saveXML($xml, "../schools/$schoolName/school.xml");
}

// setTutorialIcon("Xprize","tutorial.png");
function setTutorialIcon($schoolName, $icon) {
    $xmlLoc = "../schools/$schoolName/school.xml";
    $xml = returnXmlNode($schoolName);
    if (!$xml->tutorial) {
	$xml->addChild("tutorial", "");
    }
    $xml->tutorial->icon = $icon;
    saveXML($xml, $xmlLoc);
}

// toggleTutorial("Xprize",1);
function toggleTutorial($schoolName, $onOff) {
    $xmlLoc = "../schools/$schoolName/school.xml";
    $xml = returnXmlNode($schoolName);
    if (!$xml->tutorial) {
	$xml->addChild("tutorial", "");
    }
    $xml->tutorial->active = $onOff;
    saveXML($xml, $xmlLoc);
}

// setScrapbookIcon("Xprize","scrapbook.png");
function setScrapbookIcon($schoolName, $icon) {
    $xmlLoc = "../schools/$schoolName/school.xml";
    $xml = returnXmlNode($schoolName);
    if (!$xml->scrapbook) {
	$xml->addChild("scrapbook", "");
    }
    $xml->scrapbook->icon = $icon;
    saveXML($xml, $xmlLoc);
}

// toggleScrapbook("Xprize",1);
function toggleScrapbook($schoolName, $onOff) {
    $xmlLoc = "../schools/$schoolName/school.xml";
    $xml = returnXmlNode($schoolName);
    if (!$xml->scrapbook) {
	$xml->addChild("scrapbook", "");
    }
    $xml->scrapbook->active = $onOff;
    saveXML($xml, $xmlLoc);
}

// Helpers

function returnXmlNode($schoolName) {
    $xmlLoc = "../schools/$schoolName/school.xml";
    // Create xml
    if (!file_exists($xmlLoc)) {
	file_put_contents($xmlLoc, "<school></school>");
    }
    $str = file_get_contents($xmlLoc);
    if ($str == "") {
	$str = "<school></school>";
    }
    $xml = new SimpleXMLElement($str);
    // Create school node
    if (!$xml) {
	$xml->name = $schoolName;
    }
    return $xml;
}

function returnXmlAndSubjectNode($schoolName, $subjectName) {
    $xmlLoc = "../schools/$schoolName/school.xml";
    // Create xml
    if (!file_exists($xmlLoc)) {
	file_put_contents($xmlLoc, "<school></school>");
    }
    $str = file_get_contents($xmlLoc);
    $xml = new SimpleXMLElement($str);
    // Create school node
    if (!$xml->name) {
	$xml->name = $schoolName;
    }
    if (!$xml->subjects) {
	$xml->addChild("subjects", "");
    }
    // Find subject node.
    $subjectNode = false;
    foreach ($xml->subjects->children() as $subject) {
	if ($subject->name == $subjectName) {
	    $subjectNode = $subject;
	}
    }
    // Create subject node (if none found)
    if (!$subjectNode) {
	$subjectNode = $xml->subjects->addChild("subject");
	$subjectNode->name = $subjectName;
    }
    return [$xml, $subjectNode];
}
