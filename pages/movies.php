<?php
require_once __DIR__ . '/../config/tmdb.php';
include __DIR__ . '/../includes/header.php';

$page = $_GET['page'] ?? 1;
$genre = $_GET['genre'] ?? null;

$movie_genres = [
    28 => 'Action',
    12 => 'Adventure',
    16 => 'Animation',
    35 => 'Comedy',
    80 => 'Crime',
    99 => 'Documentary',
    18 => 'Drama',
    10751 => 'Family',
    14 => 'Fantasy',
    36 => 'History',
    27 => 'Horror',
    10402 => 'Music',
    9648 => 'Mystery',
    10749 => 'Romance',
    878 => 'Sci-Fi',
    10770 => 'TV Movie',
    53 => 'Thriller',
    10752 => 'War',
    37 => 'Western'
];

if ($genre && array_key_exists($genre, $movie_genres)) {
    $movies = fetchFromTMDB('/discover/movie', ['page' => 1, 'with_genres' => $genre]);
    $title = $movie_genres[$genre] . " Movies";
} else {
    $movies = fetchFromTMDB('/movie/popular', ['page' => 1]);
    $title = "Popular Movies";
}

$totalPages = $movies['total_pages'] ?? 1;
?>

<div class="container" style="padding-top: calc(var(--header-height) + 40px); min-height: 80vh;">
    
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px; margin-bottom: 30px;">
        <h1 style="margin-bottom: 0;"><?= htmlspecialchars($title) ?></h1>
        
        <!-- Premium Genre Filter Bar -->
        <div class="filter-bar" style="margin-bottom: 0;">
            <div class="filter-select-wrapper">
                <select id="genreSelect" onchange="applyMovieFilter()">
                    <option value="">All Genres</option>
                    <?php foreach ($movie_genres as $id => $name): ?>
                        <option value="<?= $id ?>" <?= $genre == $id ? 'selected' : '' ?>><?= htmlspecialchars($name) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>
    </div>
    
    <div class="movie-grid" id="movieGrid">
        <?php 
        if ($movies && isset($movies['results']) && !empty($movies['results'])) {
            foreach ($movies['results'] as $item) {
                // Ensure type is movie for movie-card.php if missing
                $item['title'] = $item['title'] ?? $item['name'] ?? 'Unknown';
                include __DIR__ . '/../includes/movie-card.php';
            }
        } else {
            echo "<p id='noResultsMessage' style='grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-secondary);'>No movies found matching these filters.</p>";
        }
        ?>
    </div>
    
    <!-- Infinite Scroll Loading spinner -->
    <div id="infiniteScrollLoading" style="display: none; text-align: center; padding: 40px 0;">
        <ion-icon name="sync-outline" class="spin" style="font-size: 2.2rem; color: #f5c518;"></ion-icon>
    </div>
</div>

<script>
function applyMovieFilter() {
    const select = document.getElementById('genreSelect');
    const genre = select.value;
    const url = new URL(window.location.href);
    
    if (genre) {
        url.searchParams.set('genre', genre);
    } else {
        url.searchParams.delete('genre');
    }
    url.searchParams.delete('page'); // Let JS handle infinite scroll starting at page 1
    
    window.location.href = url.pathname + url.search;
}

// Infinite Scroll implementation
(function() {
    let currentPage = 1;
    let totalPages = parseInt("<?= $totalPages ?>") || 1;
    let loading = false;
    const grid = document.getElementById('movieGrid');
    const spinner = document.getElementById('infiniteScrollLoading');
    const genre = "<?= $genre ?>";
    
    if (totalPages <= 1) return;

    window.addEventListener('scroll', () => {
        if (loading || currentPage >= totalPages) return;
        
        // Trigger load when user is 500px from the bottom of the page
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 500) {
            loadNextPage();
        }
    });

    async function loadNextPage() {
        loading = true;
        if (spinner) spinner.style.display = 'block';
        
        currentPage++;
        
        const basePath = window.basePath || '';
        let url = `${basePath}/api/discover.php?type=movie&page=${currentPage}`;
        if (genre) {
            url += `&genre=${genre}`;
        }
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                data.results.forEach(item => {
                    const cardHtml = createCard(item, basePath);
                    grid.insertAdjacentHTML('beforeend', cardHtml);
                });
            }
            
            totalPages = data.total_pages || totalPages;
        } catch (err) {
            console.error('Error fetching next page:', err);
            currentPage--; // rollback
        } finally {
            loading = false;
            if (spinner) spinner.style.display = 'none';
        }
    }

    function createCard(item, basePath) {
        const title = item.title || item.name || 'Unknown';
        const type = item.media_type || (item.title ? 'movie' : 'tv');
        const poster = item.poster_path 
            ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
            : 'https://via.placeholder.com/342x513?text=No+Poster';
            
        return `
            <a href="${basePath}/details?id=${item.id}&type=${type}" class="movie-card">
                <img loading="lazy" src="${poster}" alt="${title}">
                <div class="movie-info">
                    <div class="movie-title">${title}</div>
                </div>
            </a>
        `;
    }
})();
</script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
