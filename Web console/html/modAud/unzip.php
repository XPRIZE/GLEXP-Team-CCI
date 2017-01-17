<?php

include_once("../../includes/loginCheck.php");
include_once("../php/rrmdir.php");
$percent = isset($_GET['percent']) ? $_GET['percent'] : false;
if (loginCheck()) {
    if ($percent) {
        if ($_FILES['audios']) {
            $username = $_SESSION['username'];
            $old = $username . '_auds';
            $new = $username . '_auds_modified';

            if (file_exists($username . "_upload.zip")) {
                unlink($username . "_upload.zip");
            };
            if (is_dir($old)) {
                rrmdirAct($old);
            }
            if (is_dir($new)) {
                rrmdirAct($new);
            }
            move_uploaded_file($_FILES['audios']['tmp_name'], $username . "_upload.zip");
            $zip = new ZipArchive;
            if ($zip->open($username . '_upload.zip') === TRUE) {
                $zip->extractTo($old);
                $zip->close();
                mkdir($new);
                chmod($new, 0777);
                foreach (scandir($old) as $file) {
                    if ('.' === $file) continue;
                    if ('..' === $file) continue;
                    $ext = explode(".", $file);
                    if ($ext[1] != "wav") continue;
                    shell_exec("sox -v $percent '$old/$file' '$new/$file'");
                }
                shell_exec("zip -r $new.zip $new");
                echo "<a href=$new.zip>Zip download</a></br></br><a href='index.html'>Do another one.</a>";

            } else {
                echo "Bad zip!";
            }
        } else {
            echo "<a href=index.html>No zip file! Try again.</a>";
        }
    } else {
        // header("location: index.php");
    }
} else {
    echo "Not logged in!";
}
?>