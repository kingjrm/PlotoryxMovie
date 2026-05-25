<?php
require_once __DIR__ . '/../config/tmdb.php';
include __DIR__ . '/../includes/header.php';

$query = $_GET['q'] ?? '';
$page = $_GET['page'] ?? 1;

$results = [];
if ($query) {
    $results = fetchFromTMDB('/search/multi', ['query' => $query, 'page' => $page]);
}
?>

<div class="container" style="padding-top: calc(var(--header-height) + 40px); min-height: 80vh;">
    <h1 style="margin-bottom: 30px;">Search Results for "<?= htmlspecialchars($query) ?>"</h1>
    
    <div class="movie-grid">
        <?php 
        if (!empty($results['results'])) {
            foreach ($results['results'] as $item) {
                if ($item['media_type'] === 'person') continue; // Skip persons
                include __DIR__ . '/../includes/movie-card.php';
            }
        } else {
            echo "<p>No results found.</p>";
        }
        ?>
    </div>
</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
