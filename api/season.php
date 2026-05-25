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

$id = $_GET['id'] ?? '';
$season = $_GET['season'] ?? '1';

if (empty($id)) {
    echo json_encode(['episodes' => []]);
    exit;
}

$data = fetchFromTMDB("/tv/$id/season/$season");
if (!$data) {
    echo json_encode(['episodes' => []]);
    exit;
}

echo json_encode($data);
