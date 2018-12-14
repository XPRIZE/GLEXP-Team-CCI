<?php
require_once("../../config.php");



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