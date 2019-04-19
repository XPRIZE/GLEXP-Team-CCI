<?php

require_once("../../config.php");


chdir('../');
require('../../includes/loginCheck.php');
require('../php/setSchoolXML.php');
$school = $_GET['school'];
$subject = $_GET['subject'];
$color = $_GET['color'];

if ($ret = loginCheck() === true) {
    setSubjectColor($school, $subject, $color);
    echo "done";
}