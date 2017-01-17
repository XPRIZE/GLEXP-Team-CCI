<?php

/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 6/22/2016
 * Time: 4:28 PM
 */
function createBook($seriesName, $childName) {
    include("version.inc");

    $depLoc = "../../bookDependencies/production/R" . $dependenciesVersion . "/";
    if ($seriesName == false && $childName == false) {
	$childName = "MainXML";
    } else {

    }
    $scriptLoc = $depLoc . "script/";

    $indexHTML = '<html>
	<head debug=\"true\" startOpened=\"true\">
	<meta charset=\"UTF-8\"/>
	<meta http-equiv=\"cache-control\" content=\"max-age=0\" />
	<meta http-equiv=\"cache-control\" content=\"no-cache\" />
	<meta http-equiv=\"expires\" content=\"0\" />
	<meta http-equiv=\"expires\" content=\"Tue, 01 Jan 1980 1:00:00 GMT\" />
	<meta http-equiv=\"pragma\" content=\"no-cache\" />
	</head>
	<script src="MainXML.js"></script>
	<script src="audio/sprite.js"></script>
	<script src="images/imgCheck.js"></script>
	<script src="images/gifFrames/gifInfo.js"></script>';

    $scripts = [
	'jquery.min.js',
	'load.js',
	'messyHTML.js',
	'mouse.js',
	'sequence.js',
	'effects.js',
	'buffer.js',
	'progress.js',
	'saveStates.js',
	'debugging.js',
	'bookBugs.js',
	'bookFonts.js',
	'fileUploader.js',
    ];
    $styles = ['style.css', 'initialProgressGraph.css'];
    foreach ($scripts as $script) {
	$indexHTML = $indexHTML . '<script src = "' . $scriptLoc . $script . '"></script>';
    }
    foreach ($styles as $style) {
	$indexHTML = $indexHTML . '<link rel="stylesheet" href="' . $scriptLoc . $style . '"></link>';
    }

    $indexHTML = $indexHTML . '<script>
    var dependenciesVer = ' . $dependenciesVersion . ';
    var dependenciesLoc = "' . $depLoc . '";
    var xmlLoc = "' . $childName . '.xml";
    var seriesName = "' . $seriesName . '";
</script>';

    $indexHTML = $indexHTML . '</head>
<body class="noSelect">
</body>
</html>';

    echo $indexHTML;
}

function createIntro() {
    include("version.inc");

    $depLoc = "../../../bookDependencies/production/R" . $dependenciesVersion . "/";
    $scriptLoc = $depLoc . "script/";

    $indexHTML = '<html>
    <head debug=\"true\" startOpened=\"true\">
	<meta charset=\"UTF-8\"/>
	<meta http-equiv=\"cache-control\" content=\"max-age=0\" />
	<meta http-equiv=\"cache-control\" content=\"no-cache\" />
	<meta http-equiv=\"expires\" content=\"0\" />
	<meta http-equiv=\"expires\" content=\"Tue, 01 Jan 1980 1:00:00 GMT\" />
	      <meta http-equiv=\"pragma\" content=\"no-cache\" />
    </head>';

    $scripts = [
	'jquery.min.js',
	'load.js',
	'messyHTML.js',
	'mouse.js',
	'sequence.js',
	'effects.js',
	'buffer.js',
	'progress.js',
	'saveStates.js',
	'debugging.js',
	'bookBugs.js',
	'bookFonts.js',
	'fileUploader.js',
    ];
    $styles = ['style.css', 'initialProgressGraph.css'];
    foreach ($scripts as $script) {
	$indexHTML = $indexHTML . '<script src="' . $scriptLoc . $script . '"></script>';
    }
    foreach ($styles as $style) {
	$indexHTML = $indexHTML . '<link rel="stylesheet" href="' . $scriptLoc . $style . '"></link>';
    }

    $indexHTML = $indexHTML . '<script>
    var dependenciesVer = ' . $dependenciesVersion . ';
    var dependenciesLoc = "' . $depLoc . '";
    var xmlLoc = "MainXML.xml";
    </script>';

    $indexHTML = $indexHTML . '</head>
<body class="noSelect">
</body>
</html>';

    echo $indexHTML;
}

function createTutorial() {
    include("version.inc");

    $depLoc = "../../../../bookDependencies/production/R" . $dependenciesVersion . "/";
    $scriptLoc = $depLoc . "script/";

    $indexHTML = '<html>
    <head debug=\"true\" startOpened=\"true\">
	<meta charset=\"UTF-8\"/>
	<meta http-equiv=\"cache-control\" content=\"max-age=0\" />
	<meta http-equiv=\"cache-control\" content=\"no-cache\" />
	<meta http-equiv=\"expires\" content=\"0\" />
	<meta http-equiv=\"expires\" content=\"Tue, 01 Jan 1980 1:00:00 GMT\" />
	      <meta http-equiv=\"pragma\" content=\"no-cache\" />
	      <script src="images/gifFrames/gifInfo.js"></script>
    </head>';

    $scripts = [
	'jquery.min.js',
	'load.js',
	'messyHTML.js',
	'mouse.js',
	'sequence.js',
	'effects.js',
	'buffer.js',
	'progress.js',
	'saveStates.js',
	'debugging.js',
	'bookBugs.js',
	'bookFonts.js',
	'fileUploader.js',
    ];
    $styles = ['style.css', 'initialProgressGraph.css'];
    foreach ($scripts as $script) {
	$indexHTML = $indexHTML . '<script src="' . $scriptLoc . $script . '"></script>';
    }
    foreach ($styles as $style) {
	$indexHTML = $indexHTML . '<link rel="stylesheet" href="' . $scriptLoc . $style . '"></link>';
    }

    $indexHTML = $indexHTML . '<script>
    var dependenciesVer = ' . $dependenciesVersion . ';
    var dependenciesLoc = "' . $depLoc . '";
    var xmlLoc = "MainXML.xml";
    </script>';

    $indexHTML = $indexHTML . '</head>
<body class="noSelect">
</body>
</html>';

    echo $indexHTML;
}

function createUnit() {
    include("version.inc");

    $depLoc = "../../../../../bookDependencies/production/R" . $dependenciesVersion . "/";
    $scriptLoc = $depLoc . "script/";

    $indexHTML = '<html>
    <head debug=\"true\" startOpened=\"true\">
	<meta charset=\"UTF-8\"/>
	<meta http-equiv=\"cache-control\" content=\"max-age=0\" />
	<meta http-equiv=\"cache-control\" content=\"no-cache\" />
	<meta http-equiv=\"expires\" content=\"0\" />
	<meta http-equiv=\"expires\" content=\"Tue, 01 Jan 1980 1:00:00 GMT\" />
	      <meta http-equiv=\"pragma\" content=\"no-cache\" />
	      <script src="images/gifFrames/gifInfo.js"></script>
    </head>';

    $scripts = [
	'jquery.min.js',
	'load.js',
	'messyHTML.js',
	'mouse.js',
	'sequence.js',
	'effects.js',
	'buffer.js',
	'progress.js',
	'saveStates.js',
	'debugging.js',
	'bookBugs.js',
	'bookFonts.js',
	'fileUploader.js',
    ];
    $styles = ['style.css', 'initialProgressGraph.css'];
    foreach ($scripts as $script) {
	$indexHTML = $indexHTML . '<script src="' . $scriptLoc . $script . '"></script>';
    }
    foreach ($styles as $style) {
	$indexHTML = $indexHTML . '<link rel="stylesheet" href="' . $scriptLoc . $style . '"></link>';
    }

    $indexHTML = $indexHTML . '<script  >
    var dependenciesVer = ' . $dependenciesVersion . ';
    var dependenciesLoc = "' . $depLoc . '";
    var xmlLoc = "MainXML.xml";
    </script>';

    $indexHTML = $indexHTML . '</head>
<body class="noSelect">
</body>
</html>';

    echo $indexHTML;
}

?>