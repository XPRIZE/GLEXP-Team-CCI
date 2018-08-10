<?php
/**
 
 * User: Jason
 * Date: 6/15/2016
 * Time: 4:57 PM
 */
include('../includes/secSession.php');
sec_session_start();
$_SESSION['userBrowser'] = false;
$_SESSION['username'] = false;
$_SESSION['loginString'] = false;
session_unset();

header("location:selectSeries.php");

?>
