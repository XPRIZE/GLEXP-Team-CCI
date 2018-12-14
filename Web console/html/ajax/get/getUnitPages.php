<?php
require_once("../../config.php");

$errors = false;
$unit = $_GET['unitName'];
$level = isset($_GET['levelName']) ? $_GET['levelName'] : false;
$subject = isset($_GET['subjectName']) ? $_GET['subjectName'] : false;
$isTutorial = isset($_GET['isTutorial']) ? $_GET['isTutorial'] : false;
$school = $_GET['schoolName'];
chdir('../');

include('../php/checkSchoolNames.php');
$schoolIDs = checkNameTaken($school, $subject, $level, $unit);

include_once('../../includes/dbConnect.php');
$con = new DBConnect();
$sql = $con->mysqli;
$stmt = $sql->prepare("SELECT refPage, `refSeries`, `refChild`, `refBook` FROM unitPages WHERE unitID = ? ORDER BY `unitPage`");
$stmt->bind_param('s', $schoolIDs['unit']);
$stmt->execute();
$ret = [];
$result = $stmt->get_result();
/* fetch associative array */
while ($row = $result->fetch_assoc()) {
    array_push($ret, $row);
}
$result->free();

include('../php/getPageInfoByLoc.php');


$pageList = [];
for ($p = 0; $p < count($ret); $p++) {
    $pageList[$p] = [];
    $pageList[$p]['page'] = $ret[$p]['refPage'];
    $sqlObj = false;
    if ($ret[$p]['refChild'] == null) {
	// It's a book
	$pageList[$p]['type'] = "Book";
	$bookName = $ret[$p]['refBook'];
	$pageList[$p]['name'] = $bookName;
        $pageList[$p]['from'] = "Static export";
	$sqlObj = $sql->prepare("SELECT ID from books where `name` = ?");
	$sqlObj->bind_param('s', $bookName);
	$sqlObj->execute();
	$sqlObj->bind_result($bookID);
	$sqlObj->fetch();
	$loc = "../books/$bookID/MainXML.xml";
    } else {
	// It's a series
	$pageList[$p]['type'] = "Child";
	$childName = $ret[$p]['refChild'];
	$pageList[$p]['name'] = $childName;
	$seriesName = $ret[$p]['refSeries'];
	$pageList[$p]['seriesName'] = $seriesName;
        $pageList[$p]['from'] = "Parent '$seriesName'";
	$loc = "../series/$seriesName/$childName.xml";
    }
    $pageInfo = getPageInfoByLoc($loc);
    if (gettype($pageInfo) == "string" && count(explode("error:", $pageInfo)) > 1) {
	$errors = true;
	echo $pageInfo . "<br>";
    } else {
	$pageList[$p]['height'] = $pageInfo[0]['height'];
	$pageList[$p]['width'] = $pageInfo[0]['width'];
    }
}
if (!$errors) {
    echo json_encode($pageList);
}
?>