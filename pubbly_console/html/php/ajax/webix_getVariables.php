<?php

chdir("../../");
require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(WEB_ROOT . "/php/main.php");
require_once(CLASS_ROOT . "/mysql_query.php");
require_once(CLASS_ROOT . "/sec_session.php");
if (LOGGED_IN) {
    $query = new Mysql_query();
    $vExports = $query->fetchArray("
SELECT
    srs.ID AS series_id,
    srs.name AS seriesName,
    srs.folder AS folder,
    cld.child_id AS variable_id,
    cld.childName AS variableName
FROM
    series srs
LEFT JOIN children cld ON
    srs.name = cld.seriesName
WHERE
    1", []);
    // see webix_getUnits.php... Same prob.
    if (!isset($vExports[0]) || !is_array($vExports[0])) {
        $vExports = [$vExports];
    }

    $menuBuild = [];
    foreach ($vExports as $vExport) {
        if ($vExport) {
            $folder = $vExport['folder'];
            $seriesName = $vExport['seriesName'];
            $variableName = $vExport['variableName'];
            $id = $vExport['variable_id'];
            if (!isset($menuBuild[$folder])) {
                $menuBuild[$folder] = [];
            }
            if (!isset($menuBuild[$folder][$seriesName])) {
                $menuBuild[$folder][$seriesName] = [];
            }
            $obj = [
                "value" => $variableName,
                "variable_id" => $id,
            ];
            array_push($menuBuild[$folder][$seriesName], $obj);
        }
    }


    $webixElem = [
        "value" => "Variables",
        "data" => []
    ];
    foreach ($menuBuild as $folderName => $folder) {
        $folderObj = [
            "value" => $folderName,
            "open" => false,
            "data" => []
        ];
        foreach ($folder as $seriesName => $series) {
            $seriesObj = [
                "value" => $seriesName,
                "open" => false,
                "data" => []
            ];
            foreach ($series as $vExport) {
                array_push($seriesObj['data'], $vExport);
            }
            array_push($folderObj['data'], $seriesObj);
        }
        array_push($webixElem['data'], $folderObj);
    }
    echo json_encode($webixElem);
}
