<?php
function mostRecentModifiedFileTime($dirName,$doRecursive) {
    $d = dir($dirName);
    $lastModified = 0;
    while($entry = $d->read()) {
        if ($entry != "." && $entry != "..") {
            if (!is_dir($dirName."/".$entry)) {
                $currentModified = filemtime($dirName."/".$entry);
            } else if ($doRecursive && is_dir($dirName."/".$entry)) {
                $currentModified = mostRecentModifiedFileTime($dirName."/".$entry,true);
            }
            if ($currentModified > $lastModified){
                $lastModified = $currentModified;
            }
        }
    }
    $d->close();
    return $lastModified;
}


$testBook = isset($_GET['testBook']) ? $_GET['testBook'] : false;
if ($testBook) {
    require_once("classes/html_fragment.php");
    $engineCode = file_get_contents("../version.txt");
    $frag = new Html_fragment("../html/engine-test.html", [
        ["PATH_TO_ENGINE", "../"],
        ["ENGINE", "$engineCode"],
        ["START_PAGE", 0],
        ["PATH_TO_BOOK", "../testBooks/$testBook"],
        ["XML_NAME", "MainXML.xml"],
        ["ENVIRONMENT", "engine"],
        ["CACHE_BREAK", mostRecentModifiedFileTime("../", true)]
    ]);
    $frag->echoOut();
}   else    {
    if ($handle = opendir('../testBooks/')) {
        echo "<h2>Pick a book to test with</h2>";
        while (false !== ($entry = readdir($handle))) {
            if ($entry !== "." && $entry !== "..") {
                $url = "testEngine.php?testBook=" . $entry;
                echo "<a href='$url'>$entry</a><br>";
            }
        }
        closedir($handle);
    }
}

?>
