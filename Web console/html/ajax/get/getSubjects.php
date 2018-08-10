<?php

/**
 
 * User: Jason
 * Date: 8/17/2016
 * Time: 10:49 AM
 */
$requestSchool = isset($_GET["school"]) ? $_GET["school"] : false;
if ($requestSchool) {
    chdir('../');
    include_once('../../includes/dbConnect.php');
    include_once('../php/checkSchoolNames.php');
    $ret = getSubjects($requestSchool);
    echo json_encode($ret);
}

function getSubjects($school) {
    $ret = checkNameTaken($school, false, false, false);
    if (isset($ret["school"])) {
	$schoolID = $ret["school"];
	$ret = [];
	$con = new DBConnect();
	$sql = $con->mysqli;
	$stmt = $sql->prepare("SELECT ID, name FROM subjects WHERE schoolID = ?");
	$stmt->bind_param('s', $schoolID);
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
    } else {
	echo "error: unknown school name";
    }
}

?>