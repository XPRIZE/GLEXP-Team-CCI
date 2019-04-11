<?php

require_once("config.php");
require_once(WEB_ROOT . "/php/main.php");
require_once(CLASS_ROOT . "/sec_session.php");
$session = new Sec_session();
$session->clear();
header("Location: login.php");
