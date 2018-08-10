<?php

/**
 
 * User: Jason
 * Date: 2/3/2016
 * Time: 11:16 AM
 */
class DBConnect
{
    public $status;
    public $mysqli;
    private $HOST;
    private $USER;
    private $PASSWORD;
    private $DATABASE;

    function DBConnect()
    {
        $this->USER = "console";
        $this->PASSWORD = "RootPasswordHere"; // Put your root db password here.
        $this->DATABASE = "console";
        $this->HOST = "localhost";
        $this->status = false;
        $this->mysqli = new mysqli($this->HOST, $this->USER, $this->PASSWORD, $this->DATABASE);
        if ($this->mysqli->connect_errno) {
            printf("Connection failed: %s\n", $this->mysqli->connect_error);
            echo "<br>it's probably because you forgot to rename the database in mysql to console when you posted to the server, dummy. (dbConnect in includes)";
            echo "<br>Also, remember to rename the user to console as well, otherwise it looks stupid..";
            exit();
        } else {
            // Good connection;
            $this->status = true;
        }
    }

    function query($str)
    {
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