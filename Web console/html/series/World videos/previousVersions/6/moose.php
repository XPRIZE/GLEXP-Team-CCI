<?php
$dir = explode("/", getCWD());
if (count($dir) == 1) {
    $dir = explode('\\', getCWD());
}
$childName = basename(__FILE__, '.php');
$seriesName = array_pop($dir);
include("../../php/bookIndex.php");
createBook($seriesName, $childName);
?>