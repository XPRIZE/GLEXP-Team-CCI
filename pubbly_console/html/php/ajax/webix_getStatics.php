<?php

chdir("../../");
require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(WEB_ROOT . "/php/main.php");
require_once(CLASS_ROOT . "/mysql_query.php");
require_once(CLASS_ROOT . "/sec_session.php");
if (LOGGED_IN) {
    $query = new Mysql_query();
    $statics = $query->fetchArray("SELECT ID as static_id, `name`, folder FROM books ORDER BY `name` ASC", []);
    // see webix_getUnits.php... Same prob.
    if (!isset($statics[0]) || !is_array($statics[0])) {
        $statics = [$statics];
    }

    $menuBuild = [];
    foreach ($statics as $static) {
        if ($static) {
            $folder = $static['folder'];
            $name = $static['name'];
            $id = $static['static_id'];
            if (!isset($menuBuild[$folder])) {
                $menuBuild[$folder] = [];
            }
            $obj = [
                "value" => $name,
                "static_id" => $id,
            ];
            array_push($menuBuild[$folder], $obj);
        }
    }
    $webixElem = [
        "value" => "Statics",
        "data" => []
    ];
    foreach ($menuBuild as $folderName => $folder) {
        $folderObj = [
            "value" => $folderName,
            "open" => false,
            "data" => []
        ];
        foreach ($folder as $static) {
            array_push($folderObj['data'], $static);
        }
        array_push($webixElem['data'], $folderObj);
    }
    echo json_encode($webixElem);
}