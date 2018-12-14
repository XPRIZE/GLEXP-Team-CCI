<?php
chdir("../../");
require_once("config.php");
require_once(INC_ROOT . "/dbConnect.php");
require_once(CLASS_ROOT . "/mysql_query.php");
require_once(CLASS_ROOT . "/sec_session.php");
$query = new Mysql_query();

$username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
$password = filter_input(INPUT_POST, 'password', FILTER_SANITIZE_STRING);
$password2 = filter_input(INPUT_POST, 'password2', FILTER_SANITIZE_STRING);
$hint = filter_input(INPUT_POST, 'hint', FILTER_SANITIZE_STRING);
$errors = [];

// Check that all vars are at least there first
if (!$username) {
    array_push($errors, "100");
}
if (!$email) {
    array_push($errors, "101");
}
if (!$password) {
    array_push($errors, "103");
}
if (!$password2) {
    array_push($errors, "104");
}
if (!$hint) {
    array_push($errors, "105");
}

// Bad characters
if ($username !== $_POST['username']) {
    array_push($errors, "500");
}
if ($email !== $_POST['email']) {
    array_push($errors, "501");
}
if ($password !== $_POST['password']) {
    array_push($errors, "503");
}
if ($hint !== $_POST['hint']) {
    array_push($errors, "504");
}

// Short usernames/passwords
if (strlen($username) < 4) {
    array_push($errors, "200");
}
if (strlen($password) < 8) {
    array_push($errors, "201");
}

// One user "John" per purchaser on site
$userExists = $query->fetchSingle("SELECT username FROM user WHERE username = ?", ["s", $username]);
// One email per ANY user on site
$emailExists = $query->fetchSingle("SELECT email FROM user WHERE email = ?", ["s", $email]);

if ($userExists) {
    array_push($errors, "300");
}
if ($emailExists) {
    array_push($errors, "301");
}

// Invalid password, hint, email
if ($password !== $password2) {
    array_push($errors, "400");
}
if ($password == $hint) {
    array_push($errors, "401");
}




if (count($errors)) {
    $errors = implode("|", $errors);
    // echo $errors;
    header("location:../../register.php?errors=$errors");
} else {
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    // php7 magic. Verify with the following
    // $passwordCorrect = password_verify("input_password", $hashPassword);

    $uid = $query->execSingleGetLastID("INSERT INTO user (username, password, email, hint) VALUES (?, ?, ?, ?)", ["ssss", $username, $hashedPassword, $email, $hint]);

    if ($uid) {
        header("location:../../index.php");
    } else {
        // Server error
        // header("location:../../register.php?errors=600");
    }
}