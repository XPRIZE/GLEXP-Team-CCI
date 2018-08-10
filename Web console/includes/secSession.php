<?php
/**
 
 * User: Jason
 * Date: 6/15/2016
 * Time: 3:01 PM
 */
function sec_session_start()
{
    $session_name = 'PubblySecure';
    $secure = false; //TODO: Change to true when hosted at HTTPS address.
    $httponly = true;
    if (ini_set('session.use_only_cookies', 1) === FALSE) {
        echo "Could not initiate session";
        exit();
    }
    $cookieParams = session_get_cookie_params();
    session_set_cookie_params($cookieParams["lifetime"],
        $cookieParams["path"],
        $cookieParams["domain"],
        $secure,
        $httponly);
    session_name($session_name);
    session_start();
    session_regenerate_id(true);
}
?>