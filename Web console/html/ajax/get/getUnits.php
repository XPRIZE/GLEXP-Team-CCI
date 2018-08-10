<?php

/**
 
 * User: Jason
 * Date: 8/19/2016
 * Time: 10:04 AM
 */
$requestSchool = isset($_GET["school"]) ? $_GET["school"] : false;
$requestSubject = isset($_GET["subject"]) ? $_GET["subject"] : false;
$requestLevel = isset($_GET["level"]) ? $_GET["level"] : false;
if ($requestSchool && $requestSubject && $requestLevel) {
    chdir('../');
    include('../../includes/dbConnect.php');
    include('../php/checkSchoolNames.php');
    $ret = getUnits($requestSchool, $requestSubject, $requestLevel);
    echo json_encode($ret);
}

function getUnits($schoolName, $subjectName, $levelName) {
    $ret = checkNameTaken($schoolName, $subjectName, $levelName, false);
    $schoolID = $ret["school"];
    $subjectID = $ret["subject"];
    $levelID = $ret["level"];
    $ret = [];
    $con = new DBConnect();
    $sql = $con->mysqli;
    $stmt = $sql->prepare("SELECT ID, `name`, `order`, outdated FROM units WHERE schoolID = ? AND subjectID = ? AND levelID = ? ORDER BY `order`");
	// echo "$schoolID, $subjectID, $levelID";
    $stmt->bind_param('sss', $schoolID, $subjectID, $levelID);
    $stmt->execute();
    if ($result = $stmt->get_result()) {
	/* fetch associative array */
	while ($row = $result->fetch_assoc()) {
	    array_push($ret, $row);
	}
	$result->free();
	return $ret;
    } else {
	echo "error: bad sql stmt";
    }
}

?>