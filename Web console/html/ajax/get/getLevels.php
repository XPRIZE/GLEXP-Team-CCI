<?php
require_once("../../config.php");

$requestSchool = isset($_GET["school"]) ? $_GET["school"] : false;
$requestSubject = isset($_GET["subject"]) ? $_GET["subject"] : false;
if ($requestSchool && $requestSubject) {
    chdir('../');
    include('../../includes/dbConnect.php');
    include('../php/checkSchoolNames.php');
    $ret = getLevels($requestSchool, $requestSubject);
    echo json_encode($ret);
}

function getLevels($schoolName, $subjectName) {
    $ret = checkNameTaken($schoolName, $subjectName, false, false);
    $schoolID = $ret["school"];
    $subjectID = $ret["subject"];
    $ret = [];
    $con = new DBConnect();
    $sql = $con->mysqli;
    $stmt = $sql->prepare("SELECT ID, `name` FROM levels WHERE schoolID = ? AND subjectID = ?");
    $stmt->bind_param('ss', $schoolID, $subjectID);
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