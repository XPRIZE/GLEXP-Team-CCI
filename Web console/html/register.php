<?php
/**
 
 * User: Jason
 * Date: 7/7/2016
 * Time: 2:19 PM
 */

include('../includes/loginCheck.php');
if (loginCheck() === true) {
    header("Location: selectSeries.php");
} else {
    $html = file_get_contents('html/register.html');
    echo $html;
}

?>