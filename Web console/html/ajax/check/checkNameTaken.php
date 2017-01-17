<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 8/17/2016
 * Time: 10:19 AM
 */

chdir('../');
$school = isset($_GET["school"]) ? $_GET["school"] : false;
$subject = isset($_GET["subject"]) ? $_GET["subject"] : false;
$level = isset($_GET["level"]) ? $_GET["level"] : false;
$unit = isset($_GET["unit"]) ? $_GET["unit"] : false;

include('../php/checkSchoolNames.php');
$ret = checkNameTaken($school, $subject, $level, $unit);
echo json_encode($ret);





?>