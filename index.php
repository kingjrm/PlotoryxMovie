<?php
session_start();

// Load environment variables (Basic parser for .env)
if(file_exists(__DIR__ . '/.env')) {
    $envLines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach($envLines as $line) {
        if(strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

// Routing
require_once __DIR__ . '/config/routes.php';
$config = require __DIR__ . '/config/config.php';
$request = $_SERVER['REQUEST_URI'];
$base_path = $config['BASE_URL'];

// Case-insensitive replace for base path
$path = str_ireplace([$base_path . '/index.php', $base_path], '', $request);
$path = strtok($path, '?'); // Remove query params

if (empty($path) || $path === '/') {
    $path = '/';
}

// Define route handling
$routes = getRoutes();
if(array_key_exists($path, $routes)) {
    require_once __DIR__ . '/pages/' . $routes[$path];
} else {
    // 404 Not Found
    http_response_code(404);
    echo "<h2>404 Not Found</h2><p>Page: " . htmlspecialchars($path) . "</p>";
}
