<?php
require_once("../../config.php");

chdir('../');
require('../../includes/loginCheck.php');
require('../php/setSchoolXML.php');
$orig = $_GET['orig'];
$translation = $_GET['translation'];
$school = $_GET['school'];

if ($ret = loginCheck() === true) {
    setSchoolTranslation($school, $orig, $translation);
    echo "done";
}