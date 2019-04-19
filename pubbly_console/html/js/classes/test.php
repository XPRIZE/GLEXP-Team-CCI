<?php

$what = (isset($_GET['what'])) ? $_GET['what'] : false;
if ($what) {
    echo "
<html>
    <head>
        <script src=$what.js></script>
        <script src=$what" . "_test.js></script>
    </head>
    <body>
    </body>
</html>
";
} else {
    $jsClassesForTesting = scandir("./");
    foreach ($jsClassesForTesting as $testMaybe) {
        $isJS = explode(".js", $testMaybe);
        if (isset($isJS[1])) {
            $isTest = explode("_test.js", $testMaybe);
            if (!isset($isTest[1])) {
                $scriptName = $isJS[0];
                echo "<a href='test.php?what=$scriptName'>$testMaybe</a><br>";
            }
        }
    }
}
?>