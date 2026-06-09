<?php
require_once __DIR__ . '/../config/tmdb.php';
include __DIR__ . '/../includes/header.php';

$query = $_GET['q'] ?? '';
$page = max(1, (int)($_GET['page'] ?? 1));

$results = [];
$popular = [];
if ($query) {
    $results = fetchFromTMDB('/search/multi', ['query' => $query, 'page' => $page]);
}

// Fetch popular items for recommendations if search yields no results
if (empty($results['results'])) {
    $popular = fetchFromTMDB('/trending/all/day');
}
?>

<div class="container" style="padding-top: calc(var(--header-height) + 40px); min-height: 80vh;">
    <?php if (!empty($results['results'])): ?>
        <h1 style="margin-bottom: 30px; font-weight:700; font-family:var(--font-family-title); color:var(--text-secondary); font-size: 1.6rem;">
            Explore titles related to: <span style="color:var(--text-primary);">"<?= htmlspecialchars($query) ?>"</span>
        </h1>
        
        <div class="movie-grid">
            <?php 
            foreach ($results['results'] as $item) {
                if ($item['media_type'] === 'person') continue; // Skip persons
                include __DIR__ . '/../includes/movie-card.php';
            }
            ?>
        </div>
    <?php else: ?>
        <div class="no-results" style="padding: 40px 0;">
            <p style="color: var(--text-secondary); margin-bottom: 25px; font-size: 1.15rem; font-weight: 500;">
                Your search for "<strong><?= htmlspecialchars($query) ?></strong>" did not have any matches.
            </p>
            
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 26px; border-radius: 12px; margin-bottom: 50px; max-width: 600px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <h3 style="margin-bottom: 12px; font-size: 1.1rem; color: var(--text-primary); font-family:var(--font-family-title); font-weight: 700;">Suggestions:</h3>
                <ul style="list-style-type: disc; padding-left: 20px; color: var(--text-secondary); line-height: 1.8; font-size: 0.95rem;">
                    <li>Try different keywords</li>
                    <li>Looking for a movie or TV show? Try searching for its title</li>
                    <li>Try searching for a genre name (e.g. Action, Comedy, Romance)</li>
                </ul>
            </div>
            
            <h2 style="font-size: 1.45rem; font-weight:700; margin-bottom: 25px; font-family:var(--font-family-title); border-left: 4px solid var(--accent); padding-left: 12px; letter-spacing: 0.5px;">POPULAR SEARCHES</h2>
            <div class="movie-grid">
                <?php 
                if ($popular && isset($popular['results'])) {
                    $items = array_slice($popular['results'], 0, 12);
                    foreach ($items as $item) {
                        include __DIR__ . '/../includes/movie-card.php';
                    }
                }
                ?>
            </div>
        </div>
    <?php endif; ?>
</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
