<?php
session_start();
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_SESSION['username'] ?? 'guest'; // fallback to 'guest' if not logged in
    $moves = intval($_POST['moves']);
    $time = intval($_POST['time']);

    $stmt = $conn->prepare("INSERT INTO game_stats (username, moves, time_elapsed) VALUES (?, ?, ?)");
    $stmt->bind_param("sii", $username, $moves, $time);
    $stmt->execute();
    $stmt->close();
}
?>
