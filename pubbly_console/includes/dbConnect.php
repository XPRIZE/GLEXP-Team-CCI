<?php
class DBConnect {

    public $status;
    public $mysqli;
    private $HOST;
    private $USER;
    private $PASSWORD;
    private $DATABASE;

    function __construct() {
        $this->USER = getenv("DB_USER");
        $this->PASSWORD = getenv("DB_PASSWORD");
        $this->DATABASE = getenv("DB_NAME");
        $this->HOST = getenv("DB_HOST");
        $this->status = false;
        $this->mysqli = new mysqli($this->HOST, $this->USER, $this->PASSWORD, $this->DATABASE);
        if ($this->mysqli->connect_errno) {
            printf("Connection failed: %s\n", $this->mysqli->connect_error);
            echo "<br>Make sure mysql user '$this->USER' has full access to the $this->DATABASE db. Also, double check the password for the $this->USER in file includes/dbConnect.php)";
            exit();
        } else {
            // Good connection;
            $this->status = true;
        }
    }

    function query($str) {
        if ($request = $this->mysqli->query($str)) {
            $ret = $request->fetch_all();
            $request->close();
            return $ret;
        } else {
            printL("Something wrong with query");
            printL($str);
        }
    }

}

?>
