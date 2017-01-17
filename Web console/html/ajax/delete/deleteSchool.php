<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 8/17/2016
 * Time: 11:15 AM
 */

chdir('../');
$schoolName = $_GET['schoolName'];

include_once("../../includes/loginCheck.php");
if (loginCheck()) {
    include('../php/checkSchoolNames.php');
    $ret = checkNameTaken($schoolName, false, false, false);
    if (isset($ret["school"])) {
        $schoolID = $ret["school"];
        $con = new dbConnect();
        $sql = $con->mysqli;

        $stmt = $sql->prepare("SELECT ID FROM units WHERE schoolID = ?");
        $stmt->bind_param('s', $schoolID);
        $stmt->execute();
        $result = $stmt->get_result();
        $unitCount = $result->num_rows;
        if ($unitCount < 10) {
            while ($unit = $result->fetch_assoc()) {
                $sqlObj = false;
                $sqlObj = $sql->prepare("DELETE FROM unitPages WHERE unitID = ?");
                $sqlObj->bind_param("s",$unit['ID']);
                $sqlObj->execute();
            }
            $result->free();

            $sqlObj = false;
            $sqlObj = $sql->prepare("DELETE FROM units WHERE schoolID = ?");
            $sqlObj->bind_param('s', $schoolID);
            $sqlObj->execute();

            $sqlObj = $sql->prepare("DELETE FROM schools WHERE name = ?");
            $sqlObj->bind_param('s', $schoolName);
            $sqlObj->execute();

            $sqlObj = false;
            $sqlObj = $sql->prepare("DELETE FROM subjects WHERE schoolID = ?");
            $sqlObj->bind_param('s', $schoolID);
            $sqlObj->execute();

            $sqlObj = false;
            $sqlObj = $sql->prepare("DELETE FROM levels WHERE schoolID = ?");
            $sqlObj->bind_param('s', $schoolID);
            $sqlObj->execute();



            include('../php/rrmdir.php');
            if (rrmdir("schools/$schoolName")) {
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