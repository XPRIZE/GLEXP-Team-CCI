<?php
require_once("../../config.php");

chdir('../');

$bookName = isset($_GET['bookName']) ? $_GET['bookName'] : false;
include_once("../../includes/loginCheck.php");
if (loginCheck()) {
    if ($bookName) {
        $con = new dbConnect();
        $sql = $con->mysqli;
        $sqlObj = $sql->prepare("SELECT ID FROM books WHERE `name` = ?");
        $sqlObj->bind_param('s', $bookName);
        $sqlObj->execute();
        $result = $sqlObj->get_result();
        $last = $result->fetch_assoc();
        $id = $last['ID'];
        if ($id && $id !== "") {
            $sqlObj = false;

            $stmt = $sql->prepare("DELETE FROM books WHERE `name` = ?");
            $stmt->bind_param('s', $bookName);
            $stmt->execute();

            $stmt = false;
            $stmt = $sql->prepare("DELETE FROM unitPages WHERE `refBook` = ?");
            $stmt->bind_param('s', $bookName);
            $stmt->execute();

            $date = new DateTime();
            $stamp = $date->getTimestamp();
            $dir = "../deletedBooks/$bookName" . "_" . "$stamp/";
            rename("../books/$id/", $dir);

            echo "done";
        }
    } else {
        echo "error: Missing bookName";
    }
} else {
    echo "error: Not logged in";
}