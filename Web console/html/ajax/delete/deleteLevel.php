<?php
/**
 
 * User: Jason
 * Date: 8/17/2016
 * Time: 11:15 AM
 */

chdir('../');
$schoolName = $_GET['schoolName'];
$subjectName = $_GET['subjectName'];
$levelName = $_GET['levelName'];

include_once("../../includes/loginCheck.php");
if (loginCheck()) {
    include('../php/checkSchoolNames.php');
    $ret = checkNameTaken($schoolName, $subjectName, $levelName, false);
    if (isset($ret["school"]) && isset($ret["subject"]) && isset($ret["level"])) {
        $schoolID = $ret["school"];
        $subjectID = $ret["subject"];
        $levelID = $ret["level"];
        $con = new dbConnect();
        $sql = $con->mysqli;

        $stmt = $sql->prepare("SELECT ID FROM units WHERE schoolID = ? AND subjectID = ? AND levelID = ?");
        $stmt->bind_param('sss', $schoolID, $subjectID, $levelID);
        $stmt->execute();
        $result = $stmt->get_result();
        $unitCount = $result->num_rows;
        if ($unitCount < 10) {
            while ($unit = $result->fetch_assoc()) {
                $sqlObj = false;
                $sqlObj = $sql->prepare("DELETE FROM unitPages WHERE unitID = ?");
                $sqlObj->bind_param("s", $unit['ID']);
                $sqlObj->execute();
            }
            $result->free();
            $sqlObj = false;
            $sqlObj = $sql->prepare("DELETE FROM units WHERE schoolID = ? AND subjectID = ? AND levelID = ?");
            $sqlObj->bind_param('sss', $schoolID, $subjectID, $levelID);
            $sqlObj->execute();


            $sqlObj = $sql->prepare("DELETE FROM levels WHERE schoolID = ? AND subjectID = ? AND name = ?");
            $sqlObj->bind_param('sss', $schoolID, $subjectID, $levelName);
            $sqlObj->execute();

            // Totally remove the dir
            include('../php/rrmdir.php');
            if (rrmdir("schools/$schoolName/$subjectName/$levelName")) {
                echo "done";
            };
        } else {
            echo "error: This action will delete $unitCount units (catch is at 10+). Too scary for me. If you really want to do this, contact Jason. Or delete units individually and get the number down.";
        }
    } else {
        echo "error: School, Subject or Level does not exist";
    }
}

?>