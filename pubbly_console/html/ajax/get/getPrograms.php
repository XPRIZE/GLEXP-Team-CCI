<?php
require_once("../../config.php");

chdir('../../');
$ret = [];
require_once('../includes/dbConnect.php');
require_once('php/classes/program.php');
$con = new DBConnect();
$sql = $con->mysqli;
$stmt = $sql->prepare("SELECT sch.school_id AS programID, sch.outdated AS outdated, sch.name AS programName, count(unt.ID) AS unitCount from school sch RIGHT JOIN units unt ON unt.schoolID = sch.school_id WHERE 1 GROUP BY sch.school_id");
$stmt->execute();
if ($result = $stmt->get_result()) {
    while ($row = $result->fetch_assoc()) {
        array_push($ret, $row);
    }
    $progs = [];
    $result->free();
    foreach ($ret as $i => $row) {
        $prog = new Program($row['programName']);
        /*
          $jsonLoc = "program/" . $row['programName'] . "/data.json";
          $entryPointLoc = "program/" . $row['programName'] . "/entry.txt";
          $offlineZipLoc = "program/" . $row['programName'] . "/offline.zip";
          $apkLoc = "program/" . $row['programName'] . "/apk/development.apk";

          if (file_exists($jsonLoc)) {
          if (file_exists($apkLoc)) {
          $ret[$i]['modified'] = filemtime($apkLoc);
          $ret[$i]['status'] = "exported";
          } else {
          $ret[$i]['modified'] = filemtime($jsonLoc);
          $ret[$i]['status'] = "created";
          }
          } else {
          $ret[$i]['modified'] = "new";
          $ret[$i]['status'] = "new";
          }
         */
        array_push($progs, $prog->info);
    }
    echo json_encode($progs);
} else {
    return "error: bad sql stmt";
}
?>