<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 6/16/2016
 * Time: 5:49 PM
 */

if (isset($GLOBALS["seriesName"])) {
    $seriesName = $GLOBALS["seriesName"];
    echo $seriesName;
}   else    {
    echo "Error: Series name missing."; // really shouldn't happen, and it's a big problem if it does.
}

?>