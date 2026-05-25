<?php
// Dynamically calculate the base URL path relative to document root.
// Handles running in a subdirectory (e.g. /PlotoryxMovie) or at the domain root.
$doc_root = strtolower(str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT'] ?? ''));
$proj_root = strtolower(str_replace('\\', '/', realpath(dirname(__DIR__)) ?: ''));

$base_url = '';
if (!empty($doc_root) && strpos($proj_root, $doc_root) === 0) {
    // To preserve the original casing of the project folder:
    $original_proj_root = str_replace('\\', '/', realpath(dirname(__DIR__)) ?: '');
    $base_url = substr($original_proj_root, strlen($doc_root));
}
$base_url = rtrim($base_url, '/');

return [
    'BASE_URL' => $base_url,
    'TMDB_API_KEY' => $_ENV['TMDB_API_KEY'] ?? '',
    'TMDB_BASE_URL' => 'https://api.themoviedb.org/3',
    'TMDB_IMAGE_BASE_URL' => 'https://image.tmdb.org/t/p/',
];
