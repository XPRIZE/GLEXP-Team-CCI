<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 7/9/2016
 * Time: 1:24 PM
 */
include('../includes/loginCheck.php');
if (loginCheck() === true) {
    $html = file_get_contents('html/mainPage.html');
    echo $html;
} else {
    header("Location: login.php");
}
?>