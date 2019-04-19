<?php

function rrmdir($dir) {
    // gets us to the web root
    $d = 4;
    while (!file_exists("documentRoot") && $d > 0) {
	$d--;
	chdir("../");
    }

    // If we got to the web root
    if ($d) {
	$multiples = explode("/", $dir);
	$fineFolders = ["schools", "downloads", "map"]; // add to this
	if (in_array($multiples[0], $fineFolders) && count($multiples) > 1) {
	    // Should be *somewhat* safe to delete
	    rrmdirAct($dir);
	    return true;
	} else {
	    echo "error: you need permissions to delete $dir";
	    return false;
	}
    } else {
	echo "error: Could not get to web root";
	return false;
    }
}

function rrmdirAct($dir) {
    if (is_dir($dir)) {
	$objects = scandir($dir);
	foreach ($objects as $object) {
	    if ($object != "." && $object != "..") {
		if (is_dir($dir . "/" . $object)) {
		    rrmdirAct($dir . "/" . $object);
		} else {
		    unlink($dir . "/" . $object);
		}
	    }
	}
	rmdir($dir);
    }
}

?>