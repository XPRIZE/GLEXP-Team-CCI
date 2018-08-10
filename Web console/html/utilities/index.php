<?php
/**
 
 * User: Jason
 * Date: 7/19/2016
 * Time: 3:52 PM
 */

include('../../includes/loginCheck.php');
if (loginCheck() === true) {
    $html = file_get_contents('../html/utilitiesMainpage.html');
    echo $html;
} else {
    header("Location: ../login.php");
}


?>

