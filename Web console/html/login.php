<?php
/**
 
 * User: Jason
 * Date: 6/15/2016
 * Time: 12:30 PM
 */

include('../includes/loginCheck.php');
if (loginCheck() === true) {
    header("Location: selectSeries.php");
} else {
    $html = file_get_contents('html/login.html');
    echo $html;
}
?>