<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 11/9/2016
 * Time: 11:52 AM
 */

chdir('../');
require('../../includes/loginCheck.php');
require('../php/setSchoolXML.php');
$row = $_GET['row'];
$col = $_GET['col'];
$school = $_GET['school'];
$subject = $_GET['subject'];

if ($ret = loginCheck() === true) {
    setSubjectLoc($school, $subject, $row, $col);
    echo "done";
}