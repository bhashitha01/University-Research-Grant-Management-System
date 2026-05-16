<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $_SESSION['name'] = trim($_POST['name'] ?? $_SESSION['name']);
    $_SESSION['email'] = trim($_POST['email'] ?? '');
    $_SESSION['phone'] = trim($_POST['phone'] ?? '');
    $_SESSION['department'] = trim($_POST['department'] ?? '');

    if (!empty($_POST['password']) && $_POST['password'] === ($_POST['confirm_password'] ?? '')) {
        $_SESSION['password'] = $_POST['password'];
    }
}

$tab = isset($_GET['tab']) ? $_GET['tab'] : 'dashboard';
header("Location: student.php?tab=" . urlencode($tab) . "&saved=1");
exit;
