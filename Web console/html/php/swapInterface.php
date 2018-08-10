<?php
/**
 
 * User: Jason
 * Date: 6/23/2016
 * Time: 10:21 AM
 */

function createSwapInterface($seriesName)
{
    include_once('../../../includes/loginCheck.php');
    if (loginCheck() === true) {
        $html = file_get_contents('../../html/swapInterface.html');
        $html = "<script>window.seriesName = '$seriesName';</script>" . $html;
        echo $html;
    } else {
        header("Location: ../../login.php");
    }
}

?>