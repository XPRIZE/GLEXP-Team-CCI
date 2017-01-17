<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 7/7/2016
 * Time: 3:25 PM
 */

chdir('../');
require("../../includes/dbConnect.php");
require("../../includes/secSession.php");

$con = new DBConnect();
$error = 0;

if (isset($_POST['username']) && isset($_POST['email']) && isset($_POST['p']) && isset($_POST['hint'])) {
    // Sanitize and validate the data passed in
    $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $hint = filter_input(INPUT_POST, 'hint', FILTER_SANITIZE_STRING);
    $email = filter_var($email, FILTER_VALIDATE_EMAIL);
    if (!$email) {
        // Not a valid email
        echo "error: The email address you entered is not valid";
        $error++;
    }

    $password = filter_input(INPUT_POST, 'p', FILTER_SANITIZE_STRING);
    if (strlen($password) != 128) {
        // The hashed pwd should be 128 characters long.
        // If it's not, something really odd has happened
        echo "error: The hashed pwd should be 128 characters long";
        $error++;
    }

    // Username validity and password validity have been checked client side.
    // This should should be adequate as nobody gains any advantage from
    // breaking these rules.

    $mysqli = $con->mysqli;


    // check existing username
    $prep_stmt = "SELECT username FROM users WHERE username = ?";
    $stmt = $mysqli->prepare($prep_stmt);

    if ($stmt) {
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows == 1) {
            // A user with this username already exists
            echo "error: Username already taken";
            $error++;
        }
    } else {
        echo "error: Bad sql object";
        $error++;
    }

    if ($error == 0) {
        // Create hashed password using the password_hash function.
        // This function salts it with a random salt and can be verified with
        // the password_verify function.
        $hash = password_hash($password, PASSWORD_DEFAULT);

        // Insert the new user into the database
        if ($insert_stmt = $mysqli->prepare("INSERT INTO users (username, password, hash, email, passHint) VALUES (?, ?, ?, ?, ?)")) {
            $insert_stmt->bind_param('sssss', $username, $password, $hash, $email, $hint);
            // Execute the prepared query.
            if (!$insert_stmt->execute()) {
                echo "error: Bad sql obj 68";
            } else {
                echo "true";
            }
        }
    } else {
        // well shit
        $stmt->close();
    }
} else {
    echo "error: missing post variables";
}

?>