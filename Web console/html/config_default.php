<?php

// Environment variables, set in docker or here. 
putenv("DB_USER=console");
putenv("DB_PASSWORD=PutPasswordHere");
putenv("DB_NAME=console");
putenv("DB_HOST=localhost");

define('WEB_ROOT', $_SERVER['DOCUMENT_ROOT'] . "");
define('INC_ROOT', $_SERVER['DOCUMENT_ROOT'] . "/../includes");
define('CLASS_ROOT', $_SERVER['DOCUMENT_ROOT'] . "/php/classes");
define("ENVIRONMENT", "development");
?>