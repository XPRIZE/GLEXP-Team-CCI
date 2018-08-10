<?php
/**
 
 * User: Jason
 * Date: 6/15/2016
 * Time: 2:00 PM
 */
function removeBadAttempts()
{
    // TODO: ...
}

function addBadAttempt()
{
    // TODO: See checkBrute()
}

function checkBrute()
{
    return false;
    // TODO: You know damn well what to do here. Lazy
}

function login($con, $username, $password)
{
    $sql = $con->mysqli;
    $sqlObj = $sql->prepare("SELECT hash FROM users WHERE username = ? LIMIT 1");
    if ($sqlObj) {
        $sqlObj->bind_param('s', $username);
        $sqlObj->execute();
        $hash = false;
        $sqlObj->bind_result($hash);
        $sqlObj->fetch();

        if (checkBrute($con, $username)) {
            return "error: Too many attempts";
        } else {
            if (password_verify($password, $hash)) {
                removeBadAttempts($con, $username);
                include('secSession.php');
                sec_session_start();
                // Set session stuff here
                $_SESSION['username'] = $username;
                $userBrowser = $_SERVER['HTTP_USER_AGENT'];
                $_SESSION['userBrowser'] = $userBrowser;
                // XSS protection as we might print this value
                $username = preg_replace("/[^a-zA-Z0-9_\-]+/", "", $username);
                $_SESSION['username'] = $username;
                $_SESSION['loginString'] = hash('sha512', $hash . $userBrowser);
                return true;
            } else {
                addBadAttempt($con, $username);
                return "error: no match";
            }
        }
    }
}


?>