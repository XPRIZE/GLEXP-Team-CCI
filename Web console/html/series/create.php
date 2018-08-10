<?php
/**
 
 * User: Jason
 * Date: 7/16/2016
 * Time: 5:24 PM
 */

include('../../includes/loginCheck.php');
if (loginCheck() === true) {
    $html = file_get_contents('../html/selectSeries.html');
    echo $html;
} else {
    header("Location: ../login.php");
}
?>