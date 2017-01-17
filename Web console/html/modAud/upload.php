<?php

$percent = isset($_GET['percent']) ? $_GET['percent'] : false;
if ($percent) {
	$readable = $percent * 100;
	echo '<form enctype="multipart/form-data" method="post" action="unzip.php?percent=' . $percent . '">';
	echo '<input type="file" name="audios" id="audios" accept="rar/zip">';
	echo '<input type="submit">';
	echo '</p>Increase all audios by ' . $readable . '%</p>';
	echo '</form>';
	echo "</br><hr><p>NOTE: Please prepare a zip folder with only wav audio files in the root of the folder. It should look like this</p>
		<p style='margin-bottom:0px'>whatever.zip --</p>
		<p style='margin:0 100px; border-left:1px solid black'>--> Apple.wav</p>
		<p style='margin:0 100px; border-left:1px solid black'>--> Banana.wav</p>
		<p>Only wav files, no folders inside the zip. Name it whatever you want</p>";
}	else	{
	header("location: index.php");
}
	
?>