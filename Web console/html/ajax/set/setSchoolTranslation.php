<?php

/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 11/9/2016
 * Time: 12:08 PM
 */
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