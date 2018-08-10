<?php
/**
 
 * User: Jason
 * Date: 8/24/2016
 * Time: 3:37 PM
 */

chdir('../');
$ret = [];
$returnType = isset($_GET['return']) ? $_GET['return'] : "datagrid";
include('../../includes/dbConnect.php');
$con = new DBConnect();
$sql = $con->mysqli;
$stmt = $sql->prepare("SELECT ID, `name`, `longname`, pages FROM books ORDER BY `name` ASC");
$stmt->execute();
if ($result = $stmt->get_result()) {
    /* fetch associative array */
    if ($returnType == "richselect") {
        $firstRow = [];
        $firstRow['id'] = 1;
        $firstRow['dbid'] = 0;
        $firstRow['value'] = "-- Choose --";
        array_push($ret, $firstRow);
    }
    $r = 0;
    while ($row = $result->fetch_assoc()) {
        if ($returnType == "richselect") {
            $modRow = [];
            $modRow['id'] = $r + 2;
            $modRow['dbid'] = $row['ID'];
            $modRow['value'] = $row['name'];
            array_push($ret, $modRow);
        } else {
            array_push($ret, $row);
        }
        $r++;
    }
    $result->free();
    echo json_encode($ret);
} else {
    echo "error: bad sql stmt";
}

?>