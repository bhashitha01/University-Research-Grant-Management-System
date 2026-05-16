<?php
require_once '../config.php';
requireLogin();
header('Content-Type: application/json');

$action = $_POST['action'] ?? 'profile';
$db     = getDB();
$uid    = $_SESSION['userID'];

/* ── PROFILE PICTURE UPLOAD ── */
if ($action === 'avatar') {
    if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
        jsonResponse(['error' => 'No file uploaded'], 400);
    }
    $file    = $_FILES['avatar'];
    $ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array($ext, $allowed))   jsonResponse(['error' => 'Invalid file type'], 400);
    if ($file['size'] > 3 * 1024 * 1024) jsonResponse(['error' => 'File too large (max 3 MB)'], 400);

    $dir  = __DIR__ . '/../uploads/profiles/';
    if (!is_dir($dir)) mkdir($dir, 0755, true);

    // Delete old pic
    $old = $db->prepare("SELECT profile_pic FROM users WHERE userID=?");
    $old->bind_param('s', $uid);
    $old->execute();
    $oldPic = $old->get_result()->fetch_assoc()['profile_pic'] ?? '';
    if ($oldPic && file_exists($dir . $oldPic)) unlink($dir . $oldPic);

    $fname = $uid . '_' . time() . '.' . $ext;
    if (!move_uploaded_file($file['tmp_name'], $dir . $fname)) {
        jsonResponse(['error' => 'Upload failed'], 500);
    }

    $stmt = $db->prepare("UPDATE users SET profile_pic=? WHERE userID=?");
    $stmt->bind_param('ss', $fname, $uid);
    $stmt->execute();
    jsonResponse(['success' => true, 'file' => 'uploads/profiles/' . $fname]);
}

/* ── PROFILE DATA ── */
if ($action === 'profile') {
    $name   = trim($_POST['name']   ?? '');
    $email  = trim($_POST['email']  ?? '');
    $mobile = trim($_POST['mobile'] ?? '');
    if (!$name || !$email) jsonResponse(['error' => 'Name and email required'], 400);

    // Check email unique (excluding self)
    $chk = $db->prepare("SELECT userID FROM users WHERE email=? AND userID!=?");
    $chk->bind_param('ss', $email, $uid);
    $chk->execute();
    if ($chk->get_result()->fetch_assoc()) jsonResponse(['error' => 'Email already in use'], 409);

    $stmt = $db->prepare("UPDATE users SET Name=?, email=?, mobile=? WHERE userID=?");
    $stmt->bind_param('ssss', $name, $email, $mobile, $uid);
    if ($stmt->execute()) {
        $_SESSION['Name']  = $name;
        $_SESSION['email'] = $email;
        jsonResponse(['success' => true, 'name' => $name, 'email' => $email]);
    } else {
        jsonResponse(['error' => 'Update failed'], 500);
    }
}

/* ── PASSWORD CHANGE ── */
if ($action === 'password') {
    $cur  = $_POST['current']  ?? '';
    $new  = $_POST['new']      ?? '';
    $conf = $_POST['confirm']  ?? '';
    if (strlen($new) < 6)       jsonResponse(['error' => 'Password must be at least 6 characters'], 400);
    if ($new !== $conf)         jsonResponse(['error' => 'Passwords do not match'], 400);

    // Verify current password
    $s = $db->prepare("SELECT password FROM users WHERE userID=?");
    $s->bind_param('s', $uid);
    $s->execute();
    $hash = $s->get_result()->fetch_assoc()['password'] ?? '';
    if (!password_verify($cur, $hash)) jsonResponse(['error' => 'Current password is incorrect'], 400);

    $newHash = password_hash($new, PASSWORD_DEFAULT);
    $upd = $db->prepare("UPDATE users SET password=? WHERE userID=?");
    $upd->bind_param('ss', $newHash, $uid);
    if ($upd->execute()) {
        jsonResponse(['success' => true]);
    } else {
        jsonResponse(['error' => 'Update failed'], 500);
    }
}

jsonResponse(['error' => 'Invalid action'], 400);