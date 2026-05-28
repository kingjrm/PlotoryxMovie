<?php
require_once __DIR__ . '/../config/tmdb.php';
include __DIR__ . '/../includes/header.php';

$page = max(1, (int)($_GET['page'] ?? 1));
$trending = fetchFromTMDB('/trending/all/day', ['page' => $page]);
?>

<div class="container" style="padding-top: calc(var(--header-height) + 40px); min-height: 80vh;">
    <h1 style="margin-bottom: 30px;">Trending Now</h1>
    
    <div class="movie-grid">
        <?php 
        if ($trending && isset($trending['results'])) {
            foreach ($trending['results'] as $item) {
                include __DIR__ . '/../includes/movie-card.php';
            }
        }
        ?>
    </div>
    
    <div style="display: flex; justify-content: center; margin: 40px 0; gap: 20px;">
        <?php if ($page > 1): ?>
            <a href="?page=<?= $page - 1 ?>" class="btn" style="background:#333; color:white; padding:10px 20px;">Previous</a>
        <?php endif; ?>
        <a href="?page=<?= $page + 1 ?>" class="btn" style="background:#333; color:white; padding:10px 20px;">Next</a>
    </div>
</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
