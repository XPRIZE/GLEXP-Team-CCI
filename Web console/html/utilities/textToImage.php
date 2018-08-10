<?php
/**
 
 * User: Jason
 * Date: 7/19/2016
 * Time: 3:59 PM
 */

include('../../includes/loginCheck.php');
if (loginCheck() === true) {
    $html = file_get_contents('../html/textToImage.html');
    echo $html;
} else {
    header("Location: ../login.php");
}

?>