<?php

/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 8/20/2016
 * Time: 3:27 PM
 */
include('../../includes/loginCheck.php');
if (loginCheck() === true) {
    $schoolName = $_GET['schoolName'];
    $isTutorial = isset($_GET['isTutorial']) ? $_GET['isTutorial'] : false;
    $unitName = $_GET['unitName'];
    $html = file_get_contents('../html/editUnit.html');
    if ($isTutorial) {
	echo "<script>window.schoolName = '$schoolName'; window.unitName = '$unitName'; window.isTutorial = true; </script>" . $html;
    } else {
	$subjectName = $_GET['subjectName'];
	$levelName = isset($_GET['levelName']) ? $_GET['levelName'] : false;
	echo "<script>window.schoolName = '$schoolName'; window.subjectName = '$subjectName'; window.levelName = '$levelName'; window.unitName = '$unitName'; </script>" . $html;
    }
} else {
    header("Location: ../login.php");
}
?>