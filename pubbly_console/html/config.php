<?php

putenv("DB_USER=pubbly_console");
putenv("DB_PASSWORD=PubblyConsolePassword");
putenv("DB_NAME=pubbly_console");
putenv("DB_HOST=localhost");

define('WEB_ROOT', $_SERVER['DOCUMENT_ROOT'] . "/pubbly_console/html");
define('INC_ROOT', $_SERVER['DOCUMENT_ROOT'] . "/pubbly_console/includes");
define('CLASS_ROOT', $_SERVER['DOCUMENT_ROOT'] . "/pubbly_console/html/php/classes");
define("ENVIRONMENT", "development");

define("OPEN_REGISTRATION", true);
define("BRAND", "Local");
?>