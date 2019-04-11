<?php

chdir("../../");
require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(WEB_ROOT . "/php/main.php");
require_once(CLASS_ROOT . "/mysql_query.php");
require_once(CLASS_ROOT . "/sec_session.php");
if (LOGGED_IN) {
    $query = new Mysql_query();
    $units = $query->fetchArray("SELECT
  sch.name AS school_name,
  sub.name AS subject_name,
  lvl.name AS level_name,
  unt.name AS unit_name,
  unt.ID AS unit_id
FROM
  schools sch
LEFT JOIN
  subjects sub ON sch.ID = sub.schoolID
LEFT JOIN
  levels lvl ON sub.ID = lvl.subjectID
LEFT JOIN
  units unt ON lvl.ID = unt.levelID
WHERE
  1
ORDER BY
  sch.ID,
  sub.ID,
  lvl.ID,
  unt.ID", []);
    if (!isset($units[0]) || !is_array($units[0])) {
        // fetchArray on a single row returns an array of the cols.
        // fetchArray on >1 row returns an array of the rows with columns.
        // Which is what we want 90% of the time... but not here, because of the foreach($units ...) loop
        $units = [$units];
    }

// TODO: 
    /*
     * Same logic is used for creating webix tree shit from a multi whatever sql request.
     * 
     * Somehow we can refactor this to combine code in webix_get[static, units, variable] using an array to signify the hirearchy
     * 
     * [school, subject, level, unit]
     * [folder, static]
     * [folder, parent, child]
     * 
     * BUt deadlines, so its copy for now.
     */
    $menuBuild = [];
    foreach ($units as $unit) {
        if ($unit) {
            $school = $unit['school_name'];
            $subject = $unit['subject_name'];
            $level = $unit['level_name'];
            $id = $unit['unit_id'];
            $unit = $unit['unit_name'];
            if (!isset($menuBuild[$school])) {
                $menuBuild[$school] = [];
            }
            if (!isset($menuBuild[$school][$subject])) {
                $menuBuild[$school][$subject] = [];
            }
            if (!isset($menuBuild[$school][$subject][$level])) {
                $menuBuild[$school][$subject][$level] = [];
            }
            $obj = [
                "value" => $unit,
                "unit_id" => $id,
            ];
            array_push($menuBuild[$school][$subject][$level], $obj);
        }
    }


    $webixElem = [
        "value" => "Schools",
        "data" => []
    ];
    foreach ($menuBuild as $schoolName => $school) {
        $schoolObj = [
            "value" => $schoolName,
            "open" => false,
            "data" => []
        ];
        foreach ($school as $subjectName => $subject) {
            $subjectObj = [
                "value" => $subjectName,
                "open" => false,
                "data" => []
            ];
            foreach ($subject as $levelName => $level) {
                $levelObj = [
                    "value" => $levelName,
                    "open" => false,
                    "data" => []
                ];
                foreach ($level as $unit) {
                    array_push($levelObj['data'], $unit);
                }
                array_push($subjectObj['data'], $levelObj);
            }
            array_push($schoolObj['data'], $subjectObj);
        }
        array_push($webixElem['data'], $schoolObj);
    }
    echo json_encode($webixElem);
// pprint_r($webixElem);
}