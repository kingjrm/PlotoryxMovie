<?php
global $config;
$base_path = $config['BASE_URL'];
$current_path = strtok(str_ireplace([$base_path . '/index.php', $base_path], '', $_SERVER['REQUEST_URI']), '?');
if (empty($current_path) || $current_path === '/') {
    $current_path = '/';
}
?>
<nav class="navbar" id="navbar">
    <div class="container nav-container">
        <a href="<?= $base_path ?>/" class="brand">
            <img src="<?= $base_path ?>/Plotoryx-Logo.png" alt="Plotoryx" class="brand-logo-img">
            <span>Plotoryx</span>
        </a>
        
        <ul class="nav-links" id="navLinks">
            <li><a href="<?= $base_path ?>/" class="<?= $current_path === '/' ? 'active' : '' ?>">Home</a></li>
            <li><a href="<?= $base_path ?>/movies" class="<?= $current_path === '/movies' ? 'active' : '' ?>">Movies</a></li>
            <li><a href="<?= $base_path ?>/tv" class="<?= $current_path === '/tv' ? 'active' : '' ?>">TV Shows</a></li>
            <li><a href="<?= $base_path ?>/trending" class="<?= $current_path === '/trending' ? 'active' : '' ?>">Trending</a></li>
            <li><a href="<?= $base_path ?>/favorites" class="<?= $current_path === '/favorites' ? 'active' : '' ?>">Watchlist</a></li>
        </ul>
        
        <div class="nav-actions">
            <div class="search-bar" id="searchBar">
                <button type="button" class="mobile-search-trigger" id="mobileSearchTrigger">
                    <ion-icon name="search-outline"></ion-icon>
                    <span>Search</span>
                </button>
                <form action="<?= $base_path ?>/search" method="GET" id="searchForm">
                    <input type="text" name="q" placeholder="Search movies, tv..." id="searchInput" autocomplete="off">
                    <button type="button" class="close-search-btn" id="closeSearchBtn"><ion-icon name="close-outline"></ion-icon></button>
                </form>
                <div class="live-search-results" id="liveSearchResults" style="display:none;"></div>
            </div>
            
            <div class="burger-menu" id="burgerMenu">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>

    </div>
</nav>

