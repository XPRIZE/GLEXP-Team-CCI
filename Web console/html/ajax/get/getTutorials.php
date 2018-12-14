<?php
require_once("../../config.php");

$requestSchool = isset($_GET["school"]) ? $_GET["school"] : false;
if ($requestSchool) {
    chdir('../');
    include('../../includes/dbConnect.php');
    include('../php/checkSchoolNames.php');
    $tutorial = getTutorial($requestSchool);
    if ($tutorial) {
	echo json_encode($tutorial);
    }
}

function getTutorial($schoolName) {
    $ret = checkNameTaken($schoolName, false, false, false);
    if (isset($ret["school"])) {
	$schoolID = $ret["school"];
	$con = new DBConnect();
	$isTutorial = true;
	$sql = $con->mysqli;
	$stmt = $sql->prepare("SELECT ID, `name`, `tutorialType`, `subjectID`, `order`, outdated FROM units WHERE schoolID = ? AND `isTutorial` = ? ORDER BY `order`");
	$stmt->bind_param('si', $schoolID, $isTutorial);
	$stmt->execute();
	$arr = [];
	if ($result = $stmt->get_result()) {
	    while ($row = $result->fetch_assoc()) {
		array_push($arr, $row);
	    }
	    $result->free();
	    return $arr;
	} else {
	    echo "error: bad sql stmt";
	}
    } else {
	return [];
    }
}

?>