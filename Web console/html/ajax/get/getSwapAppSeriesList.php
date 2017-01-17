<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 6/30/2016
 * Time: 4:09 PM
 */

chdir('../');
$ret = [];

include_once('../../includes/dbConnect.php');
$con = new dbConnect();
if ($con) {
    $sql = $con->mysqli;
    $stmt = $sql->prepare("SELECT ID, name FROM series WHERE deleted=0 ORDER BY `name` ASC");
    $stmt->execute();
    if ($result = $stmt->get_result()) {
        /* fetch associative array */
        while ($row = $result->fetch_assoc()) {
            array_push($ret, $row);
        }
        $result->free();
    } else {
        echo "error: bad sql stmt";
    }
} else {
    echo "error: Bad sql object";
}

for ($s = 0; $s < count($ret); $s++) {
    $curName = $ret[$s]['name'];
    $versions = scandir("../series/$curName/previousVersions/");
    $lastVersion = 0;
    foreach ($versions as &$version) {
        if ($version != "." && $version != "..") {
            if ($version > $lastVersion) {
                $lastVersion = $version;
            }
        }
    }
    $curVersion = $lastVersion + 1;
    $ret[$s]['version'] = $curVersion;

    $ret[$s]['children'] = [];
    if ($con) {
        $sql = $con->mysqli;
        $stmt = $sql->prepare("SELECT childName FROM children WHERE seriesName = ? AND deleted = 0");
        $stmt->bind_param('s', $ret[$s]['name']);
        $stmt->execute();
        if ($result = $stmt->get_result()) {
            /* fetch associative array */
            while ($row = $result->fetch_assoc()) {
                array_push($ret[$s]['children'], $row['childName']);
            }
            $result->free();
        } else {
            echo "error: bad sql stmt";
        }
    } else {
        echo "error: Bad sql object";
    }

}
echo json_encode($ret);


?>