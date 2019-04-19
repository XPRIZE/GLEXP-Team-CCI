<?php
$dir = explode('/', getCWD());
if (count($dir) == 1) {
    $dir = explode('\\', getCWD());
}
$seriesName = array_pop($dir);

echo "TODO: A way of representing series $seriesName";
?>