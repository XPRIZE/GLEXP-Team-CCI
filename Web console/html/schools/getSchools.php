<?php

$ret = [];
chdir("../downloads");
$dir = new DirectoryIterator(getCWD());
foreach ($dir as $fileinfo) {
    if (!$fileinfo->isDot()) {
	$extCheck = explode("_", $fileinfo->getFileName());
	if (isset($extCheck[1]) && $extCheck[1] == "version") {
	    if ($fileinfo->getSize() < 1000) {
		$info = [];
		$info['name'] = $extCheck[0];
		$versDoc = file_get_contents($fileinfo->getFileName());
		$info['version'] = explode("|",$versDoc)[0];
		$info['size'] = explode("|",$versDoc)[1];
		array_push($ret, $info);
	    }
	}
    }
}
echo json_encode($ret);
?>
