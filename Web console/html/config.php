<?php

// Environment variables, set in docker or here. 
putenv("DB_USER=console");
putenv("DB_PASSWORD=pubbly18");
putenv("DB_NAME=console");
putenv("DB_HOST=localhost");

define('WEB_ROOT', $_SERVER['DOCUMENT_ROOT'] . "/console/html");
define('INC_ROOT', $_SERVER['DOCUMENT_ROOT'] . "/console/includes");
define('CLASS_ROOT', $_SERVER['DOCUMENT_ROOT'] . "/console/html/php/classes");
define("ENVIRONMENT", "development");
?>