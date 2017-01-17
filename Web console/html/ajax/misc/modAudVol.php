<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 10/28/2016
 * Time: 4:17 PM
 */



chdir('../');
$seriesName = $_GET['seriesName'];
$childName = $_GET['childName'];
$audName = $_GET['audName'];
$action = $_GET['action'];

include("../../includes/loginCheck.php");
if (loginCheck()) {
    if (isset($seriesName) && isset($childName) && isset($audName) && isset($action)) {
        $root = "../series/$seriesName/audio";
        $ext = false;
        if (file_exists("$root/$audName.wav")) {
            $ext = "wav";
        }   else if (file_exists("$root/$audName.mp3")) {
            $ext = "mp3";
        }
        if ($ext) {
            $loc = "$root/$audName.$ext";
            $rnd = rand();
            $str = "sox -v $action '$loc' '$root/$rnd.$ext'";
            shell_exec($str);
            if (file_exists("$root/$rnd.$ext") || true) {
                rename("$root/$rnd.$ext",$loc);
                include("../php/commonDBQueries.php");
                setSwapModified($seriesName, $childName, "$audName.$ext");
            }   else    {
                echo "error: Volumn mod shell command failed. Probably update sox.";
            }
        }   else    {
            echo "error: Only mp3 and wav supported";
        }
    }	else	{
        echo "error: Missing GET vars.";
    }
}	else	{
    echo "error: Not logged in";
}




