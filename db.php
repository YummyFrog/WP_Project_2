<?php
$host = "localhost";
$user = "tdo33";
$pass = "tdo33";
$dbname = "tdo33";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
