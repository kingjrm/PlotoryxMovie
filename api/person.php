<?php
$envPath = __DIR__ . '/../.env';
if(file_exists($envPath)) {
    $envLines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach($envLines as $line) {
        if(strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}
$config = require __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/tmdb.php';

header('Content-Type: application/json');

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing person ID']);
    exit;
}

$data = fetchFromTMDB('/person/' . $id, ['append_to_response' => 'combined_credits']);

if (!$data) {
    http_response_code(404);
    echo json_encode(['error' => 'Person not found']);
    exit;
}

echo json_encode($data);
