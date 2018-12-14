<?php
require_once("../../config.php");

chdir('../');
include('../php/parentFunctions.php');
include('../php/saveXML.php');
include('../php/splitGif.php');
include('../../includes/dbConnect.php');

$file = isset($_FILES['file']) ? $_FILES['file'] : false;
$seriesName = isset($_GET['seriesName']) ? $_GET['seriesName'] : false;
if ($file) {
    if ($seriesName) {
	if ($file['type'] == "application/x-zip-compressed" || $file['type'] == "application/zip" || true) {
	    $tmpLoc = $file['tmp_name'];
	    move_uploaded_file($tmpLoc, "../series/$seriesName/NewParent.zip");
	    $zipRet = unpackParentZip($seriesName);
	    if ($zipRet === TRUE) {

		// Outdate the units that use pages from this series.
		$idsAlreadyDone = [];
		$con = new DBConnect();
		$sql = $con->mysqli;
		$sqlObj = $sql->prepare("SELECT unitID FROM unitPages WHERE refSeries = ?");
		$sqlObj->bind_param('s', $seriesName);
		$sqlObj->execute();
		$result = $sqlObj->get_result();
		/* fetch associative array */
		while ($ids = $result->fetch_assoc()) {
		    $id = $ids['unitID'];
		    if (isset($idsAlreadyDone[$id])) {
			// Already outdated that unit.
		    } else {
			$idsAlreadyDone[$id] = true;
			outdateUnit($id);
		    }
		}
		$result->free();

		// Done!
		echo "done";
	    } else {
		echo $zipRet;
	    }
	} else {
	    echo "error: Only zip files please";
	}
    } else {
	echo "error: Series name missing";
    }
} else {
    echo "error: No file uploaded";
}

function outdateUnit($id) {
    $con = new DBConnect();
    $sql = $con->mysqli;
    $obj = $sql->prepare("UPDATE units SET outdated = 1 WHERE ID = ?");
    $obj->bind_param('s', $id);
    $obj->execute();
}

?>