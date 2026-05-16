<?php
require_once '../config.php';
requireLogin();
header('Content-Type: application/json');

$db  = getDB();
$lid = $_SESSION['userID']; // this lecturer

// Total proposals assigned (all uploads — lecturer sees all)
$total    = $db->query("SELECT COUNT(*) AS c FROM uploads")->fetch_assoc()['c'];

// Pending for THIS lecturer (not yet reviewed by anyone, or status still Pending)
$pending  = $db->query("SELECT COUNT(*) AS c FROM uploads u LEFT JOIN reviews r ON r.upload_id=u.id WHERE r.id IS NULL OR r.status='Pending'")->fetch_assoc()['c'];

// Complete reviews done BY THIS lecturer
$stmt = $db->prepare("SELECT COUNT(*) AS c FROM reviews WHERE reviewer_id=? AND status IN ('Approved','Rejected')");
$stmt->bind_param('s', $lid);
$stmt->execute();
$complete = $stmt->get_result()->fetch_assoc()['c'];

// Approved by this lecturer
$stmt = $db->prepare("SELECT COUNT(*) AS c FROM reviews WHERE reviewer_id=? AND status='Approved'");
$stmt->bind_param('s', $lid);
$stmt->execute();
$approved = $stmt->get_result()->fetch_assoc()['c'];

// Rejected by this lecturer
$stmt = $db->prepare("SELECT COUNT(*) AS c FROM reviews WHERE reviewer_id=? AND status='Rejected'");
$stmt->bind_param('s', $lid);
$stmt->execute();
$rejected = $stmt->get_result()->fetch_assoc()['c'];

// Overdue (deadline passed, still not reviewed)
$overdue  = $db->query("
    SELECT COUNT(*) AS c FROM uploads u
    LEFT JOIN reviews r ON r.upload_id=u.id
    WHERE (r.id IS NULL OR r.status='Pending')
    AND DATE_ADD(u.created_at, INTERVAL u.duration MONTH) < NOW()
")->fetch_assoc()['c'];

// Recent 5 submissions
$recent = $db->query("
    SELECT u.id, u.title, u.created_at, us.Name,
           COALESCE(r.status,'Pending') AS status
    FROM uploads u
    JOIN  users us ON u.userID=us.userID
    LEFT JOIN reviews r ON r.upload_id=u.id
    ORDER BY u.created_at DESC LIMIT 5
")->fetch_all(MYSQLI_ASSOC);

jsonResponse([
    'total'    => (int)$total,
    'pending'  => (int)$pending,
    'complete' => (int)$complete,
    'approved' => (int)$approved,
    'rejected' => (int)$rejected,
    'overdue'  => (int)$overdue,
    'recent'   => $recent,
]);