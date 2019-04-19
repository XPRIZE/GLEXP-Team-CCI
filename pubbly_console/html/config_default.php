<?php

putenv("DB_USER=pubbly_console");
putenv("DB_PASSWORD=PutPasswordHere");
putenv("DB_NAME=pubbly_console");
putenv("DB_HOST=localhost");

define('WEB_ROOT', $_SERVER['DOCUMENT_ROOT'] . "");
define('INC_ROOT', $_SERVER['DOCUMENT_ROOT'] . "/../includes");
define('CLASS_ROOT', $_SERVER['DOCUMENT_ROOT'] . "/php/classes");
define("ENVIRONMENT", "development");

// Variable toggles
define("OPEN_REGISTRATION", false);
define("BRAND", "");
?>
