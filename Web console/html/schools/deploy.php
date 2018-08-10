<?php
/**
 
 * User: Jason
 * Date: 9/17/2016
 * Time: 2:12 PM
 */

include('../../includes/loginCheck.php');
if (loginCheck() === true) {
    $html = file_get_contents('../html/deploySchool.html');
    echo $html;
} else {
    header("Location: ../login.php");
}

?>