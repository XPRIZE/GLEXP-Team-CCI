<?php
$dir = explode('/', getCWD());
if (count($dir) == 1) {
    $dir = explode('\\', getCWD());
}
$seriesName = array_pop($dir);
include('../../php/swapInterface.php');
createSwapInterface($seriesName);
?>