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

$type = $_GET['type'] ?? 'movie';
$page = $_GET['page'] ?? 1;
$genre = $_GET['genre'] ?? null;
$category = $_GET['category'] ?? null;

$api_params = ['page' => $page];

if ($type === 'tv') {
    if ($category) {
        switch ($category) {
            case 'kdrama':
                $api_params['with_original_language'] = 'ko';
                $api_params['with_genres'] = '18';
                break;
            case 'cdrama':
                $api_params['with_original_language'] = 'zh';
                $api_params['with_genres'] = '18';
                break;
            case 'jdrama':
                $api_params['with_original_language'] = 'ja';
                $api_params['with_genres'] = '18';
                break;
            case 'anime':
                $api_params['with_original_language'] = 'ja';
                $api_params['with_genres'] = '16';
                break;
        }
        if ($genre) {
            $api_params['with_genres'] .= ',' . $genre;
        }
        $data = fetchFromTMDB('/discover/tv', $api_params);
    } else if ($genre) {
        $api_params['with_genres'] = $genre;
        $data = fetchFromTMDB('/discover/tv', $api_params);
    } else {
        $data = fetchFromTMDB('/tv/popular', $api_params);
    }
} else {
    if ($genre) {
        $api_params['with_genres'] = $genre;
        $data = fetchFromTMDB('/discover/movie', $api_params);
    } else {
        $data = fetchFromTMDB('/movie/popular', $api_params);
    }
}

echo json_encode($data ?: ['results' => [], 'total_pages' => 0]);
