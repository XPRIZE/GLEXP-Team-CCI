<?php

require_once(INC_ROOT . "/dbConnect.php");
require_once(CLASS_ROOT . "/site_error.php");

class Mysql_query {

    private $con;
    private $sql;
    private $dbErr;

    private function prepBinds($sql, $binds) {
        $ret = false;
        $prep = $sql;
        $stmt = $this->sql->prepare($prep);
        if ($stmt) {
            // This for bind_param.apply() <-- no php apply...
            $tmp = array();
            foreach ($binds as $key => $value) {
                $tmp[$key] = &$binds[$key];
            }

            // This now takes the place of 
            // $stmt->bind_param($binds[0], $binds[1]);
            if (count($binds)) {
                call_user_func_array(array($stmt, 'bind_param'), $tmp);
            }
            $stmt->execute();
            return $stmt;
        } else {
            // print_r(mysqli_error($this->sql));
            new Site_error("Bad sql object", "php/classes/mysql_queries/_master.php");
            if (isset($stmt->close)) {
                $stmt->close();
            }
            return false;
        }
    }

    public function execSingle($sql, $binds) {
        $stmt = $this->prepBinds($sql, $binds);
        if ($stmt && $stmt->affected_rows) {
            return $stmt->affected_rows;
        } else {
            return 0;
        }
    }

    public function execSingleGetLastID($sql, $binds) {
        $stmt = $this->prepBinds($sql, $binds);
        if ($stmt && $stmt->affected_rows) {
            return $stmt->insert_id;
        } else {
            return null;
        }
    }

    public function fetchSingle($sql, $binds) {
        $ret = false;
        $stmt = $this->prepBinds($sql, $binds);
        if ($stmt) {
            $stmt->bind_result($ret);
            $stmt->fetch();
            return $ret;
        }
    }

    public function fetchRows($sql, $binds) {
        $ret = [];
        $retArr = $this->prepBinds($sql, $binds);
        $result = $retArr->get_result();
        while ($row = $result->fetch_assoc()) {
            array_push($ret, $row);
        }
        $result->free();
        return $ret;

    }
    public function fetchArray($sql, $binds) {
        $ret = $this->fetchRows($sql, $binds);
        if (count($ret) === 1) {
            $ret = $ret[0];
        }
        return $ret;
    }

    public function fetchArrayAsJSON($sql, $binds) {
        return json_encode($this->fetchArray($sql, $binds));
    }

    /*
      public function import_file($filename) {
      if ($filename == "content" || $filename == "structure") {
      $op_data = "";
      $lines = file(WEB_ROOT . "/../db/$filename.sql");
      foreach ($lines as $line) {
      // This IF Remove Comment Inside SQL FILE
      if (substr($line, 0, 2) == "--" || $line == "") {
      continue;
      }
      $op_data .= $line;
      // Breack Line Upto ';' NEW QUERY
      if (substr(trim($line), -1, 1) == ";") {
      $this->sql->query($op_data);
      $op_data = "";
      }
      }

      // Check for errors
      return true;
      } else {
      // Error: Only two scripts supported so far.
      return false;
      }
      }
     */

    function __construct() {
        $this->con = new DBConnect();
        $this->sql = $this->con->mysqli;
    }

}

?>
