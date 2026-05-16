<?php
require_once '../config.php';
requireLogin();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'POST required'], 405);
}

$raw  = file_get_contents('php://input');
$data = $raw ? json_decode($raw, true) : $_POST;
if (!$data) $data = $_POST;

$uploadId      = intval($data['upload_id']      ?? 0);
$decision      = trim($data['decision']         ?? '');
$markQuality   = min(25, max(0, intval($data['mark_quality'] ?? 0)));
$markMethod    = min(25, max(0, intval($data['mark_method']  ?? 0)));
$markLit       = min(25, max(0, intval($data['mark_lit']     ?? 0)));
$markPres      = min(25, max(0, intval($data['mark_pres']    ?? 0)));
$comment       = trim($data['comment']          ?? '');
$evalDate      = trim($data['evaluation_date']  ?? date('Y-m-d'));

if (!$uploadId)                                        jsonResponse(['error' => 'Invalid proposal ID'],  400);
if (!in_array($decision, ['Approved', 'Rejected']))    jsonResponse(['error' => 'Invalid decision'],      400);
if (!$comment)                                         jsonResponse(['error' => 'Comment required'],      400);

$total      = $markQuality + $markMethod + $markLit + $markPres;
$reviewerId = $_SESSION['userID'];
$db         = getDB();

// Verify proposal exists
$chk = $db->prepare("SELECT id FROM uploads WHERE id=?");
$chk->bind_param('i', $uploadId);
$chk->execute();
if (!$chk->get_result()->fetch_assoc()) jsonResponse(['error' => 'Proposal not found'], 404);

// Upsert
$stmt = $db->prepare("
    INSERT INTO reviews
        (upload_id, reviewer_id, status, decision,
         mark_quality, mark_method, mark_lit, mark_pres,
         total_score, comment, evaluation_date, reviewed_at)
    VALUES (?, ?, ?, ?,  ?, ?, ?, ?,  ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
        reviewer_id=VALUES(reviewer_id),
        status=VALUES(status),
        decision=VALUES(decision),
        mark_quality=VALUES(mark_quality),
        mark_method=VALUES(mark_method),
        mark_lit=VALUES(mark_lit),
        mark_pres=VALUES(mark_pres),
        total_score=VALUES(total_score),
        comment=VALUES(comment),
        evaluation_date=VALUES(evaluation_date),
        reviewed_at=NOW()
");
$stmt->bind_param(
    'isssiiiiiss',
    $uploadId, $reviewerId, $decision, $decision,
    $markQuality, $markMethod, $markLit, $markPres,
    $total, $comment, $evalDate
);

if ($stmt->execute()) {
    jsonResponse(['success' => true, 'total_score' => $total, 'decision' => $decision]);
} else {
    jsonResponse(['error' => 'DB error: ' . $db->error], 500);
}