<?php
require_once(CLASS_ROOT . "/sec_session.php");
$session = new Sec_session();
define('LOGGED_IN', $session->check());

function pprint_r($what) {
    echo "<pre>";
    print_r($what);
    echo "</pre>";
}