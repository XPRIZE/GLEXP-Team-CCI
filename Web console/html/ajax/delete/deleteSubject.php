<?php
require_once("../../config.php");

chdir('../');
$schoolName = $_GET['schoolName'];
$subjectName = $_GET['subjectName'];

include_once("../../includes/loginCheck.php");
if (loginCheck()) {
    include('../php/checkSchoolNames.php');
    $ret = checkNameTaken($schoolName, $subjectName, false, false);
    if (isset($ret["school"]) && isset($ret["subject"])) {
        $schoolID = $ret["school"];
        $subjectID = $ret["subject"];
        $con = new dbConnect();
        $sql = $con->mysqli;

        $stmt = $sql->prepare("SELECT ID FROM units WHERE schoolID = ? AND subjectID = ?");
        $stmt->bind_param('ss', $schoolID, $subjectID);
        $stmt->execute();
        $result = $stmt->get_result();
        $unitCount = $result->num_rows;
        if ($unitCount < 100000) {
            while ($unit = $result->fetch_assoc()) {
                $sqlObj = false;
                $sqlObj = $sql->prepare("DELETE FROM unitPages WHERE unitID = ?");
                $sqlObj->bind_param("s",$unit['ID']);
                $sqlObj->execute();
            }
            $result->free();

            $sqlObj = $sql->prepare("DELETE FROM subjects WHERE schoolID = ? AND name = ?");
            $sqlObj->bind_param('ss', $schoolID, $subjectName);
            $sqlObj->execute();

            $sqlObj = false;
            $sqlObj = $sql->prepare("DELETE FROM levels WHERE schoolID = ? AND subjectID = ?");
            $sqlObj->bind_param('ss', $schoolID, $subjectID);
            $sqlObj->execute();

            $sqlObj = false;
            $sqlObj = $sql->prepare("DELETE FROM units WHERE schoolID = ? AND subjectID = ?");
            $sqlObj->bind_param('ss', $schoolID, $subjectID);
            $sqlObj->execute();

            include('../php/rrmdir.php');
            if (rrmdir("schools/$schoolName/$subjectName")) {
                echo "done";
            };
        }   else    {
            echo "error: This action will delete $unitCount units (catch is at 10+). Too scary for me. If you really want to do this, contact Jason. Or delete units individually and get the number down.";
        }
    } else {
        echo "error: School or subject does not exist";
    }
}

?>