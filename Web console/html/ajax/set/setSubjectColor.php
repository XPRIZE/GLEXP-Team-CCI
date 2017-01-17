<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


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