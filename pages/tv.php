<?php
require_once __DIR__ . '/../config/tmdb.php';
include __DIR__ . '/../includes/header.php';

$category = $_GET['category'] ?? null;
$genre = $_GET['genre'] ?? null;

$tv_genres = [
    10759 => 'Action & Adventure',
    16 => 'Animation',
    35 => 'Comedy',
    80 => 'Crime',
    99 => 'Documentary',
    18 => 'Drama',
    10751 => 'Family',
    10762 => 'Kids',
    9648 => 'Mystery',
    10763 => 'News',
    10764 => 'Reality',
    10765 => 'Sci-Fi & Fantasy',
    10766 => 'Soap',
    10767 => 'Talk',
    10768 => 'War & Politics',
    37 => 'Western'
];

$title = "Popular TV Shows";
$api_params = ['page' => 1];

if ($category) {
    switch ($category) {
        case 'kdrama':
            $api_params['with_original_language'] = 'ko';
            $api_params['with_genres'] = '18';
            $title = "Korean Dramas (K-Drama)";
            break;
        case 'cdrama':
            $api_params['with_original_language'] = 'zh';
            $api_params['with_genres'] = '18';
            $title = "Chinese Dramas (C-Drama)";
            break;
        case 'jdrama':
            $api_params['with_original_language'] = 'ja';
            $api_params['with_genres'] = '18';
            $title = "Japanese Dramas (J-Drama)";
            break;
        case 'anime':
            $api_params['with_original_language'] = 'ja';
            $api_params['with_genres'] = '16';
            $title = "Anime Series";
            break;
    }
    
    if ($genre && array_key_exists($genre, $tv_genres)) {
        $api_params['with_genres'] .= ',' . $genre;
        $title .= " - " . $tv_genres[$genre];
    }
    
    $tv = fetchFromTMDB('/discover/tv', $api_params);
} else if ($genre && array_key_exists($genre, $tv_genres)) {
    $api_params['with_genres'] = $genre;
    $tv = fetchFromTMDB('/discover/tv', $api_params);
    $title = $tv_genres[$genre] . " TV Shows";
} else {
    $tv = fetchFromTMDB('/tv/popular', $api_params);
}

$totalPages = $tv['total_pages'] ?? 1;
?>

<div class="container" style="padding-top: calc(var(--header-height) + 40px); min-height: 80vh;">
    
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px; margin-bottom: 30px;">
        <h1 style="margin-bottom: 0;"><?= htmlspecialchars($title) ?></h1>
        
        <!-- Premium TV Filter Bar -->
        <div class="filter-bar" style="margin-bottom: 0;">
            <!-- Category selector (K-Drama, C-Drama, Anime, etc.) -->
            <div class="filter-select-wrapper">
                <select id="categorySelect" onchange="applyTVFilters()">
                    <option value="">All TV Shows</option>
                    <option value="kdrama" <?= $category == 'kdrama' ? 'selected' : '' ?>>K-Dramas (Korean)</option>
                    <option value="cdrama" <?= $category == 'cdrama' ? 'selected' : '' ?>>C-Dramas (Chinese)</option>
                    <option value="jdrama" <?= $category == 'jdrama' ? 'selected' : '' ?>>J-Dramas (Japanese)</option>
                    <option value="anime" <?= $category == 'anime' ? 'selected' : '' ?>>Anime (Japanese)</option>
                </select>
            </div>
            
            <!-- TV Genre selector -->
            <div class="filter-select-wrapper">
                <select id="genreSelect" onchange="applyTVFilters()">
                    <option value="">All Genres</option>
                    <?php foreach ($tv_genres as $id => $name): ?>
                        <option value="<?= $id ?>" <?= $genre == $id ? 'selected' : '' ?>><?= htmlspecialchars($name) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>
    </div>
    
    <div class="movie-grid" id="tvGrid">
        <?php 
        if ($tv && isset($tv['results']) && !empty($tv['results'])) {
            foreach ($tv['results'] as $item) {
                include __DIR__ . '/../includes/movie-card.php';
            }
        } else {
            echo "<p id='noResultsMessage' style='grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-secondary);'>No TV shows found matching these filters.</p>";
        }
        ?>
    </div>
    
    <!-- Infinite Scroll Loading spinner -->
    <div id="infiniteScrollLoading" style="display: none; text-align: center; padding: 40px 0;">
        <ion-icon name="sync-outline" class="spin" style="font-size: 2.2rem; color: #f5c518;"></ion-icon>
    </div>
</div>

<script>
function applyTVFilters() {
    const categorySelect = document.getElementById('categorySelect');
    const genreSelect = document.getElementById('genreSelect');
    
    const category = categorySelect.value;
    const genre = genreSelect.value;
    
    const url = new URL(window.location.href);
    
    if (category) {
        url.searchParams.set('category', category);
    } else {
        url.searchParams.delete('category');
    }
    
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
    let totalPages = parseInt(<?= json_encode($totalPages) ?>) || 1;
    let loading = false;
    const grid = document.getElementById('tvGrid');
    const spinner = document.getElementById('infiniteScrollLoading');
    const category = <?= json_encode($category) ?>;
    const genre = <?= json_encode($genre) ?>;
    
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
        let url = `${basePath}/api/discover.php?type=tv&page=${currentPage}`;
        if (category) {
            url += `&category=${category}`;
        }
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

    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag));
    }

    function createCard(item, basePath) {
        const title = escapeHTML(item.title || item.name || 'Unknown');
        const type = escapeHTML(item.media_type || (item.title ? 'movie' : 'tv'));
        const poster = item.poster_path 
            ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
            : 'https://via.placeholder.com/342x513?text=No+Poster';
        const id = escapeHTML(item.id);
            
        return `
            <a href="${basePath}/details?id=${id}&type=${type}" class="movie-card">
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
