<?php

chdir("../../");
require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(CLASS_ROOT . "/mysql_query.php");
require_once(CLASS_ROOT . "/sec_session.php");
$query = new Mysql_query();

$username = $_POST['username'];
$password = $_POST['password'];

$info = $query->fetchArray("SELECT password, user_id FROM user WHERE username = ?", ["s", $username]);
if ($info) {
    if (password_verify($password, $info['password'])) {
        $session = new Sec_session();
        $session->set("user", [
            "sessionType" => "user",
            "user_id" => $info['user_id'],
            "username" => $username,
        ]);
        header("location: ../../index.php");
    } else {
        header("location: ../../login.php?err=200");
    }
} else {
    header("location: ../../login.php?err=100");
}
?>
