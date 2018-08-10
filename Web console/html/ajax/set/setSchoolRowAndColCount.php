<?php
/**
 
 * User: Jason
 * Date: 11/9/2016
 * Time: 12:08 PM
 */


chdir('../');
require('../../includes/loginCheck.php');
require('../php/setSchoolXML.php');
$rows = $_GET['rows'];
$cols = $_GET['cols'];
$school = $_GET['school'];

if ($ret = loginCheck() === true) {
    setSchoolRowsAndCols($school,$rows,$cols);
    echo "done";
}