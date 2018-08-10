<?php
/**
 
 * User: Jason
 * Date: 6/15/2016
 * Time: 3:03 PM
 */

function loginCheck()
{
    include_once("dbConnect.php");
    include_once("secSession.php");
    $con = new dbConnect();
    sec_session_start();

    if ($con) {
        $sql = $con->mysqli;
        if (isset(
            $_SESSION['userBrowser'],
            $_SESSION['loginString'],
            $_SESSION['username'])
        ) {
            $sUserBrowser = $_SESSION['userBrowser'];
            $sUsername = $_SESSION['username'];
            $sessionLoginString = $_SESSION['loginString'];

            if ($stmt = $sql->prepare("SELECT hash FROM users WHERE username = ?")) {
                $stmt->bind_param('s', $sUsername);
                $stmt->execute();
                $stmt->store_result();
                if ($stmt->num_rows == 1) {
                    $serverHash = false;
                    $stmt->bind_result($serverHash);
                    $stmt->fetch();
                    $serverLoginString = hash('sha512', $serverHash . $sUserBrowser);
                    if ($serverLoginString == $sessionLoginString) {
                        return true;
                    } else {
                        $error = "Session strings didn't match";
                    }
                } else {
                    $error = "No such user";
                }
            } else {
                $error = "Bad prep statement";
            }
        } else {
            $error = 'Missing $_SESSION variables';
        }
    } else {
        $error = "Bad connection";
    }
    // If we didn't return at $serverLoginString == $sessionLoginString, it's an error.
    return "error: $error";
}

?>