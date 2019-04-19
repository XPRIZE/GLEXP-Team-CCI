<?php

$programName = base64_decode($_GET['programName']);

include('../includes/loginCheck.php');
if (loginCheck() === true && isset($programName)) {
    require("php/classes/program.php");
    $program = new Program($programName);
    if ($program->info['export_statuses']['database'] == "outdated") {
        $program->indirectUpdateProgram();
    }
    $program->buildWeb();
    echo "<a href='read.php?t=pg&pn=" . base64_encode($program->info['name']) . "'>Start program</a>";
} else {
    header("Location: login.php");
}
?>