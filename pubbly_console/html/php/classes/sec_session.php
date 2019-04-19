<?php

/*
 * Sec session!
 * 
 * Start for every root page, from main
 * Set a 'status' prop to not accidentally restart when we need it somewhere else
 * 
 * clear to log out
 * set to log in
 * check to ... check the log in what are you stupid or something.
 * 
 * security determined by environment variable in config.
 */

class Sec_session {
    private function start() {
        $session_name = "PubblyConsoleSecure";
        $secure = false; // TODO
        $httponly = true;
        if (ini_set('session.use_only_cookies', 1) === FALSE) {
            new Site_error("Could not initiate secure session", "php/classes/sec_session.php");
        } else {
            $cookieParams = session_get_cookie_params();
            session_set_cookie_params(
                    $cookieParams["lifetime"], $cookieParams["path"], $cookieParams["domain"], $secure, $httponly);
            session_name($session_name);
            session_start();
            // session_regenerate_id(true);
            $_SESSION['status'] = "secure or whatever";
        }
    }

    public function clear() {
        $_SESSION['userBrowser'] = false;
        $_SESSION['loginString'] = false;
        $_SESSION['user_id'] = false;
        $_SESSION['username'] = false;
        $_SESSION['sessionType'] = false;
        $_SESSION['status'] = false;
        session_unset();
    }

    public function set($what, $with) {
        if ($what == "user") {
            $hash = md5($with['user_id']);
            $userBrowser = $_SERVER['HTTP_USER_AGENT'];
            
            $_SESSION['userBrowser'] = $userBrowser;
            $_SESSION['loginString'] = hash('sha512', $hash . $userBrowser);

            $_SESSION['user_id'] = $with['user_id'];
            $_SESSION['username'] = $with['username'];
            $_SESSION['sessionType'] = "user";
        } else {
            new Site_error("Error: No other type of user on console (yet, todotodo)");
        }
    }

    public function check() {
        if (isset($_SESSION['userBrowser'])) {
            $userBrowser = $_SESSION['userBrowser'];
            $sessionLoginString = $_SESSION['loginString'];
            $uid = $_SESSION['user_id'];

            $hash = md5($uid);
            $serverLoginString = hash('sha512', $hash . $userBrowser);
            return ($serverLoginString == $sessionLoginString);
        } else {
            return false;
        }
    }

    function __construct() {
        if (!isset($_SESSION['status'])) {
            $this->start();
        } else {
            // Hopefully this resolved the occasional dropped login prob
            // session_write_close();
        }
    }

}
