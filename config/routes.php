<?php
function getRoutes() {
    return [
        '/' => 'home.php',
        '/movies' => 'movies.php',
        '/tv' => 'tv.php',
        '/trending' => 'trending.php',
        '/genres' => 'genres.php',
        '/search' => 'search.php',
        '/details' => 'details.php',
        '/watch' => 'watch.php',
        '/favorites' => 'favorites.php',
    ];
}
