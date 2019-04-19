<?php

/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 8/20/2016
 * Time: 3:27 PM
 */
include('../includes/loginCheck.php');
if (loginCheck() === true) {
    $schoolName = $_GET['schoolName'];
    $unitName = $_GET['unitName'];
    $html = file_get_contents('html/stitch_app.html');
    echo "<script>window.schoolName = '$schoolName'; window.unitName = '$unitName';</script>" . $html;
} else {
    header("Location: login.php");
}
?>