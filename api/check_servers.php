<?php
// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$domains = [
    1 => 'https://vsrc.su',
    2 => 'https://vidsrcme.ru',
    3 => 'https://vidsrc.cc',
    4 => 'https://vidlink.pro',
    5 => 'https://embed.su',
    6 => 'https://autoembed.cc',
    7 => 'https://moviesapi.club',
    8 => 'https://multiembed.to'
];

$mh = curl_multi_init();
$handles = [];

foreach ($domains as $id => $url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_NOBODY, true); // HEAD request for speed
    curl_setopt($ch, CURLOPT_TIMEOUT, 2); // 2s timeout
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 2);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    curl_multi_add_handle($mh, $ch);
    $handles[$id] = $ch;
}

// Execute handles concurrently
$running = null;
do {
    $status = curl_multi_exec($mh, $running);
    if ($status > 0) {
        curl_multi_select($mh, 0.05);
    }
} while ($running > 0);

$results = [];
foreach ($handles as $id => $ch) {
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    
    // Status codes between 200 and 499 are considered online.
    // If the server returns 405 (Method Not Allowed) or 403 (Forbidden) for HEAD requests,
    // it is still online and reachable.
    $online = ($httpCode >= 200 && $httpCode <= 499);
    
    $results[$id] = [
        'online' => $online,
        'status' => $httpCode,
        'error' => $err ? $err : null
    ];
    
    curl_multi_remove_handle($mh, $ch);
    curl_close($ch);
}

curl_multi_close($mh);

echo json_encode($results);
