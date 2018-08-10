<?php
/**
 
 * User: Jason
 * Date: 8/30/2016
 * Time: 11:16 AM
 */

function getLocFromUnitID($id)
{
    $con = new DBConnect();
    $sql = $con->mysqli;

    $unitName = false;
    $levelName = false;
    $subjectName = false;
    $schoolName = false;

    $unitID = $id;
    $levelID = false;
    $subjectID = false;
    $schoolID = false;

    $sqlObj = $sql->prepare("SELECT `name`, levelID, subjectID, schoolID FROM units WHERE ID = ?");
    $sqlObj->bind_param('s', $unitID);
    $sqlObj->execute();
    $result = $sqlObj->get_result();
    /* fetch associative array */
    $nameAndIDs = $result->fetch_assoc();
    $result->free();

    $unitName = $nameAndIDs['name'];
    $levelID = $nameAndIDs['levelID'];
    $subjectID = $nameAndIDs['subjectID'];
    $schoolID = $nameAndIDs['schoolID'];

    $sqlObj = false;
    $sqlObj = $sql->prepare("SELECT `name` FROM levels WHERE ID = ?");
    $sqlObj->bind_param('s', $levelID);
    $sqlObj->execute();
    $sqlObj->bind_result($levelName);
    $sqlObj->fetch();

    $sqlObj = false;
    $sqlObj = $sql->prepare("SELECT `name` FROM subjects WHERE ID = ?");
    $sqlObj->bind_param('s', $subjectID);
    $sqlObj->execute();
    $sqlObj->bind_result($subjectName);
    $sqlObj->fetch();

    $sqlObj = false;
    $sqlObj = $sql->prepare("SELECT `name` FROM schools WHERE ID = ?");
    $sqlObj->bind_param('s', $schoolID);
    $sqlObj->execute();
    $sqlObj->bind_result($schoolName);
    $sqlObj->fetch();

    $ret = [];
    $ret['unitName'] = $unitName;
    $ret['levelName'] = $levelName;
    $ret['subjectName'] = $subjectName;
    $ret['schoolName'] = $schoolName;

    $ret['unitID'] = $unitID;
    $ret['levelID'] = $levelID;
    $ret['subjectID'] = $subjectID;
    $ret['schoolID'] = $schoolID;

    return $ret;
}

?>