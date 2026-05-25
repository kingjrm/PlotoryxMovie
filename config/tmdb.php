<?php
$config = require __DIR__ . '/config.php';

function fetchFromTMDB($endpoint, $params = []) {
    global $config;
    $params['api_key'] = $config['TMDB_API_KEY'];
    $query = http_build_query($params);
    $url = $config['TMDB_BASE_URL'] . $endpoint . '?' . $query;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        return null;
    }
    return json_decode($response, true);
}
