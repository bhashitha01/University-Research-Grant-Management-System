<?php
require_once '../config.php';
requireLogin();
header('Content-Type: application/json');

$db = getDB();

$search = trim($_GET['search'] ?? '');
$status = trim($_GET['status'] ?? '');
$sort   = trim($_GET['sort']   ?? 'created_at');
$dir    = strtoupper(trim($_GET['dir'] ?? 'DESC')) === 'ASC' ? 'ASC' : 'DESC';

// Whitelist sort columns to prevent SQL injection
$sortMap = [
    'created_at'     => 'u.created_at',
    'title'          => 'u.title',
    'Name'           => 'us.Name',
    'total_score'    => 'r.total_score',
    'reviewed_at'    => 'r.reviewed_at',
];
$orderBy = $sortMap[$sort] ?? 'u.created_at';

// Build query
$sql = "SELECT
    u.id, u.userID, u.title, u.budget, u.duration,
    u.description, u.course_type, u.file_name, u.created_at,
    us.Name, us.email, us.course, us.mobileNumber,
    COALESCE(r.status,'Pending')   AS status,
    COALESCE(r.decision,'')        AS decision,
    COALESCE(r.mark_quality,0)     AS mark_quality,
    COALESCE(r.mark_method,0)      AS mark_method,
    COALESCE(r.mark_lit,0)         AS mark_lit,
    COALESCE(r.mark_pres,0)        AS mark_pres,
    COALESCE(r.total_score,0)      AS total_score,
    COALESCE(r.comment,'')         AS comment,
    r.evaluation_date,
    r.reviewed_at,
    r.id AS review_id
FROM uploads u
JOIN  users us ON u.userID = us.userID
LEFT JOIN reviews r ON r.upload_id = u.id
WHERE 1=1";

$params = [];
$types  = '';

if ($search !== '') {
    $sql    .= " AND (us.Name LIKE ? OR u.title LIKE ? OR u.description LIKE ? OR u.course_type LIKE ?)";
    $like    = '%' . $search . '%';
    $params  = array_merge($params, [$like, $like, $like, $like]);
    $types  .= 'ssss';
}

// Status filter — pending = no review or Pending; others match exactly
if ($status === 'Pending') {
    $sql .= " AND (r.id IS NULL OR r.status = 'Pending')";
} elseif ($status === 'Approved' || $status === 'Rejected') {
    $sql   .= " AND r.status = ?";
    $params[] = $status;
    $types .= 's';
}
// '' = all

$sql .= " ORDER BY $orderBy $dir";

$stmt = $db->prepare($sql);
if ($params) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Compute formatted dates server-side
foreach ($rows as &$row) {
    $created     = strtotime($row['created_at']);
    $dueTs       = strtotime("+{$row['duration']} month", $created);
    $row['submitted'] = date('d/m/Y', $created);
    $row['due_date']  = date('d/m/Y', $dueTs);
    // evaluation_date formatted
    $row['eval_date_fmt'] = $row['evaluation_date']
        ? date('d/m/Y', strtotime($row['evaluation_date']))
        : null;
}
unset($row);

jsonResponse(['data' => $rows, 'total' => count($rows)]);