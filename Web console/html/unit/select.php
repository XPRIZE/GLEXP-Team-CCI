<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 7/22/2016
 * Time: 10:39 AM
 */

include('../../includes/loginCheck.php');
if (loginCheck() === true) {
    $html = file_get_contents('../html/selectUnit.html');
    echo $html;
} else {
    header("Location: ../login.php");
}

?>