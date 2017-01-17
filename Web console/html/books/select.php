<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 8/24/2016
 * Time: 10:38 AM
 */

include('../../includes/loginCheck.php');
if (loginCheck() === true) {
    $html = file_get_contents('../html/selectBook.html');
    echo $html;
} else {
    header("Location: ../login.php");
}

?>