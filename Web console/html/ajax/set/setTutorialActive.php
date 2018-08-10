<?php
/**
 
 * User: Jason
 * Date: 11/10/2016
 * Time: 3:28 PM
 */

chdir('../');
require('../../includes/loginCheck.php');
require('../php/setSchoolXML.php');
$school = $_GET['school'];
$toggle = $_GET['toggle'];

if ($ret = loginCheck() === true) {
    toggleTutorial($school,$toggle);
    echo "done";
}