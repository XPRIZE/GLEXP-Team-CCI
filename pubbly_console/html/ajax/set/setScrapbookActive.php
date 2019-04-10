<?php
require_once("../../config.php");


chdir('../');
require('../../includes/loginCheck.php');
require('../php/setSchoolXML.php');
$school = $_GET['school'];
$toggle = $_GET['toggle'];

if ($ret = loginCheck() === true) {
    toggleScrapbook($school,$toggle);
    echo "done";
}