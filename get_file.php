<?php
require_once '../config.php';
requireLogin();

$id = intval($_GET['id'] ?? 0);
if (!$id) { http_response_code(400); exit('Bad request'); }

$db   = getDB();
$stmt = $db->prepare("SELECT file_name, title FROM uploads WHERE id=?");
$stmt->bind_param('i', $id);
$stmt->execute();
$row  = $stmt->get_result()->fetch_assoc();
if (!$row) { http_response_code(404); exit('Not found'); }

$filePath = __DIR__ . '/../' . $row['file_name'];
if (!file_exists($filePath)) { http_response_code(404); exit('File missing on server'); }

$ext  = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
$mime = match($ext) {
    'pdf'        => 'application/pdf',
    'docx'       => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'doc'        => 'application/msword',
    'jpg','jpeg' => 'image/jpeg',
    'png'        => 'image/png',
    default      => 'application/octet-stream',
};

header('Content-Type: '        . $mime);
header('Content-Disposition: inline; filename="' . basename($filePath) . '"');
header('Content-Length: '      . filesize($filePath));
readfile($filePath);
exit;