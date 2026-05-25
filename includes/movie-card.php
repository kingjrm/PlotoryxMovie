<?php
global $config;
$base_path = $config['BASE_URL'];

if (!isset($item) || !isset($item['id'])) {
    return;
}

$title = $item['title'] ?? $item['name'] ?? 'Unknown';
$vote_average = isset($item['vote_average']) && $item['vote_average'] > 0 ? round($item['vote_average'], 1) : '';
$release_date = $item['release_date'] ?? $item['first_air_date'] ?? 'N/A';
$year = !empty($release_date) && $release_date !== 'N/A' ? substr($release_date, 0, 4) : 'N/A';
$type = isset($item['title']) || (isset($item['media_type']) && $item['media_type'] === 'movie') ? 'movie' : 'tv';
$id = $item['id'];

// Extract poster URL or create fallback SVG poster
$poster_path = isset($item['poster_path']) && $item['poster_path'] 
    ? $config['TMDB_IMAGE_BASE_URL'] . 'w342' . $item['poster_path'] 
    : '';
?>

<a href="<?= $base_path ?>/details?id=<?= $id ?>&type=<?= $type ?>" class="movie-card">
    <?php if ($vote_average): ?>
        <div class="card-rating-badge">
            <ion-icon name="star"></ion-icon> <?= $vote_average ?>
        </div>
    <?php endif; ?>
    
    <?php if ($poster_path): ?>
        <img loading="lazy" src="<?= $poster_path ?>" alt="<?= htmlspecialchars($title) ?>">
    <?php else: ?>
        <!-- Modern fallback poster using inline SVG -->
        <div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; background:linear-gradient(135deg, #121526 0%, #0c0d16 100%); border-radius:12px; padding:20px; text-align:center;">
            <ion-icon name="image-outline" style="font-size: 3rem; color: rgba(255,255,255,0.1); margin-bottom:12px;"></ion-icon>
            <div style="font-size: 0.85rem; font-weight:600; color:var(--text-secondary); line-height: 1.3; overflow:hidden; display:-webkit-box; -webkit-line-clamp:3; line-clamp:3; -webkit-box-orient:vertical;"><?= htmlspecialchars($title) ?></div>
        </div>
    <?php endif; ?>
    
    <div class="movie-info">
        <div class="movie-title"><?= htmlspecialchars($title) ?></div>
        <div class="movie-meta">
            <span class="media-type"><?= $type === 'movie' ? 'Movie' : 'TV Series' ?></span>
            <span><?= $year ?></span>
        </div>
    </div>
</a>

