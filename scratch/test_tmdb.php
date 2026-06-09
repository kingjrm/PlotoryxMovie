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
require_once __DIR__ . '/../config/tmdb.php';
$id = 141973;
$type = 'tv';
$details = fetchFromTMDB("/$type/$id", ['append_to_response' => 'videos']);
if (!$details) {
    echo "Failed to fetch details\n";
    exit;
}
echo "Show Title: " . ($details['name'] ?? 'Unknown') . "\n\n";
if (isset($details['videos']['results'])) {
    foreach ($details['videos']['results'] as $video) {
        echo "Name: " . $video['name'] . "\n";
        echo "Key: " . $video['key'] . "\n";
        echo "Type: " . $video['type'] . "\n";
        echo "Site: " . $video['site'] . "\n";
        echo "---------------------------\n";
    }
} else {
    echo "No videos found.\n";
}
