<?php
require_once __DIR__ . '/../config/tmdb.php';
include __DIR__ . '/../includes/header.php';

$movie_genres_list = [
    ['id' => 28, 'name' => 'Action', 'icon' => 'flame-outline', 'icon_color' => '#e50914', 'color' => 'linear-gradient(135deg, rgba(229, 9, 20, 0.2) 0%, rgba(229, 9, 20, 0.03) 100%)', 'border' => 'rgba(229, 9, 20, 0.25)', 'glow' => 'rgba(229, 9, 20, 0.3)'],
    ['id' => 12, 'name' => 'Adventure', 'icon' => 'compass-outline', 'icon_color' => '#10b981', 'color' => 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.03) 100%)', 'border' => 'rgba(16, 185, 129, 0.25)', 'glow' => 'rgba(16, 185, 129, 0.3)'],
    ['id' => 16, 'name' => 'Animation', 'icon' => 'color-palette-outline', 'icon_color' => '#ec4899', 'color' => 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.03) 100%)', 'border' => 'rgba(236, 72, 153, 0.25)', 'glow' => 'rgba(236, 72, 153, 0.3)'],
    ['id' => 35, 'name' => 'Comedy', 'icon' => 'happy-outline', 'icon_color' => '#f5c518', 'color' => 'linear-gradient(135deg, rgba(245, 197, 24, 0.2) 0%, rgba(245, 197, 24, 0.03) 100%)', 'border' => 'rgba(245, 197, 24, 0.25)', 'glow' => 'rgba(245, 197, 24, 0.3)'],
    ['id' => 80, 'name' => 'Crime', 'icon' => 'shield-half-outline', 'icon_color' => '#6366f1', 'color' => 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.03) 100%)', 'border' => 'rgba(99, 102, 241, 0.25)', 'glow' => 'rgba(99, 102, 241, 0.3)'],
    ['id' => 99, 'name' => 'Documentary', 'icon' => 'videocam-outline', 'icon_color' => '#06b6d4', 'color' => 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.03) 100%)', 'border' => 'rgba(6, 182, 212, 0.25)', 'glow' => 'rgba(6, 182, 212, 0.3)'],
    ['id' => 18, 'name' => 'Drama', 'icon' => 'sad-outline', 'icon_color' => '#a855f7', 'color' => 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.03) 100%)', 'border' => 'rgba(168, 85, 247, 0.25)', 'glow' => 'rgba(168, 85, 247, 0.3)'],
    ['id' => 10751, 'name' => 'Family', 'icon' => 'people-outline', 'icon_color' => '#f43f5e', 'color' => 'linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(244, 63, 94, 0.03) 100%)', 'border' => 'rgba(244, 63, 94, 0.25)', 'glow' => 'rgba(244, 63, 94, 0.3)'],
    ['id' => 14, 'name' => 'Fantasy', 'icon' => 'sparkles-outline', 'icon_color' => '#8b5cf6', 'color' => 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.03) 100%)', 'border' => 'rgba(139, 92, 246, 0.25)', 'glow' => 'rgba(139, 92, 246, 0.3)'],
    ['id' => 36, 'name' => 'History', 'icon' => 'library-outline', 'icon_color' => '#b45309', 'color' => 'linear-gradient(135deg, rgba(180, 83, 9, 0.2) 0%, rgba(180, 83, 9, 0.03) 100%)', 'border' => 'rgba(180, 83, 9, 0.25)', 'glow' => 'rgba(180, 83, 9, 0.3)'],
    ['id' => 27, 'name' => 'Horror', 'icon' => 'skull-outline', 'icon_color' => '#ef4444', 'color' => 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.03) 100%)', 'border' => 'rgba(239, 68, 68, 0.25)', 'glow' => 'rgba(239, 68, 68, 0.3)'],
    ['id' => 10402, 'name' => 'Music', 'icon' => 'musical-notes-outline', 'icon_color' => '#ec4899', 'color' => 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.03) 100%)', 'border' => 'rgba(236, 72, 153, 0.25)', 'glow' => 'rgba(236, 72, 153, 0.3)'],
    ['id' => 9648, 'name' => 'Mystery', 'icon' => 'help-circle-outline', 'icon_color' => '#94a3b8', 'color' => 'linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(148, 163, 184, 0.03) 100%)', 'border' => 'rgba(148, 163, 184, 0.25)', 'glow' => 'rgba(148, 163, 184, 0.3)'],
    ['id' => 10749, 'name' => 'Romance', 'icon' => 'heart-outline', 'icon_color' => '#f43f5e', 'color' => 'linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(244, 63, 94, 0.03) 100%)', 'border' => 'rgba(244, 63, 94, 0.25)', 'glow' => 'rgba(244, 63, 94, 0.3)'],
    ['id' => 878, 'name' => 'Sci-Fi', 'icon' => 'planet-outline', 'icon_color' => '#3b82f6', 'color' => 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.03) 100%)', 'border' => 'rgba(59, 130, 246, 0.25)', 'glow' => 'rgba(59, 130, 246, 0.3)'],
    ['id' => 53, 'name' => 'Thriller', 'icon' => 'eye-outline', 'icon_color' => '#f97316', 'color' => 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.03) 100%)', 'border' => 'rgba(249, 115, 22, 0.25)', 'glow' => 'rgba(249, 115, 22, 0.3)'],
    ['id' => 10752, 'name' => 'War', 'icon' => 'hammer-outline', 'icon_color' => '#78716c', 'color' => 'linear-gradient(135deg, rgba(120, 113, 108, 0.2) 0%, rgba(120, 113, 108, 0.03) 100%)', 'border' => 'rgba(120, 113, 108, 0.25)', 'glow' => 'rgba(120, 113, 108, 0.3)'],
    ['id' => 37, 'name' => 'Western', 'icon' => 'trail-sign-outline', 'icon_color' => '#d97706', 'color' => 'linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(217, 119, 6, 0.03) 100%)', 'border' => 'rgba(217, 119, 6, 0.25)', 'glow' => 'rgba(217, 119, 6, 0.3)']
];

$tv_genres_list = [
    ['id' => 10759, 'name' => 'Action & Adventure', 'icon' => 'flame-outline', 'icon_color' => '#e50914', 'color' => 'linear-gradient(135deg, rgba(229, 9, 20, 0.2) 0%, rgba(229, 9, 20, 0.03) 100%)', 'border' => 'rgba(229, 9, 20, 0.25)', 'glow' => 'rgba(229, 9, 20, 0.3)'],
    ['id' => 16, 'name' => 'Animation', 'icon' => 'color-palette-outline', 'icon_color' => '#ec4899', 'color' => 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.03) 100%)', 'border' => 'rgba(236, 72, 153, 0.25)', 'glow' => 'rgba(236, 72, 153, 0.3)'],
    ['id' => 35, 'name' => 'Comedy', 'icon' => 'happy-outline', 'icon_color' => '#f5c518', 'color' => 'linear-gradient(135deg, rgba(245, 197, 24, 0.2) 0%, rgba(245, 197, 24, 0.03) 100%)', 'border' => 'rgba(245, 197, 24, 0.25)', 'glow' => 'rgba(245, 197, 24, 0.3)'],
    ['id' => 80, 'name' => 'Crime', 'icon' => 'shield-half-outline', 'icon_color' => '#6366f1', 'color' => 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.03) 100%)', 'border' => 'rgba(99, 102, 241, 0.25)', 'glow' => 'rgba(99, 102, 241, 0.3)'],
    ['id' => 99, 'name' => 'Documentary', 'icon' => 'videocam-outline', 'icon_color' => '#06b6d4', 'color' => 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.03) 100%)', 'border' => 'rgba(6, 182, 212, 0.25)', 'glow' => 'rgba(6, 182, 212, 0.3)'],
    ['id' => 18, 'name' => 'Drama', 'icon' => 'sad-outline', 'icon_color' => '#a855f7', 'color' => 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.03) 100%)', 'border' => 'rgba(168, 85, 247, 0.25)', 'glow' => 'rgba(168, 85, 247, 0.3)'],
    ['id' => 10751, 'name' => 'Family', 'icon' => 'people-outline', 'icon_color' => '#f43f5e', 'color' => 'linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(244, 63, 94, 0.03) 100%)', 'border' => 'rgba(244, 63, 94, 0.25)', 'glow' => 'rgba(244, 63, 94, 0.3)'],
    ['id' => 10762, 'name' => 'Kids', 'icon' => 'balloon-outline', 'icon_color' => '#10b981', 'color' => 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.03) 100%)', 'border' => 'rgba(16, 185, 129, 0.25)', 'glow' => 'rgba(16, 185, 129, 0.3)'],
    ['id' => 9648, 'name' => 'Mystery', 'icon' => 'help-circle-outline', 'icon_color' => '#94a3b8', 'color' => 'linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(148, 163, 184, 0.03) 100%)', 'border' => 'rgba(148, 163, 184, 0.25)', 'glow' => 'rgba(148, 163, 184, 0.3)'],
    ['id' => 10763, 'name' => 'News', 'icon' => 'newspaper-outline', 'icon_color' => '#06b6d4', 'color' => 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.03) 100%)', 'border' => 'rgba(6, 182, 212, 0.25)', 'glow' => 'rgba(6, 182, 212, 0.3)'],
    ['id' => 10764, 'name' => 'Reality', 'icon' => 'trophy-outline', 'icon_color' => '#f5c518', 'color' => 'linear-gradient(135deg, rgba(245, 197, 24, 0.2) 0%, rgba(245, 197, 24, 0.03) 100%)', 'border' => 'rgba(245, 197, 24, 0.25)', 'glow' => 'rgba(245, 197, 24, 0.3)'],
    ['id' => 10765, 'name' => 'Sci-Fi & Fantasy', 'icon' => 'planet-outline', 'icon_color' => '#3b82f6', 'color' => 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.03) 100%)', 'border' => 'rgba(59, 130, 246, 0.25)', 'glow' => 'rgba(59, 130, 246, 0.3)'],
    ['id' => 10766, 'name' => 'Soap', 'icon' => 'water-outline', 'icon_color' => '#ec4899', 'color' => 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.03) 100%)', 'border' => 'rgba(236, 72, 153, 0.25)', 'glow' => 'rgba(236, 72, 153, 0.3)'],
    ['id' => 10767, 'name' => 'Talk', 'icon' => 'chatbubbles-outline', 'icon_color' => '#a855f7', 'color' => 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.03) 100%)', 'border' => 'rgba(168, 85, 247, 0.25)', 'glow' => 'rgba(168, 85, 247, 0.3)'],
    ['id' => 10768, 'name' => 'War & Politics', 'icon' => 'ribbon-outline', 'icon_color' => '#78716c', 'color' => 'linear-gradient(135deg, rgba(120, 113, 108, 0.2) 0%, rgba(120, 113, 108, 0.03) 100%)', 'border' => 'rgba(120, 113, 108, 0.25)', 'glow' => 'rgba(120, 113, 108, 0.3)'],
    ['id' => 37, 'name' => 'Western', 'icon' => 'trail-sign-outline', 'icon_color' => '#d97706', 'color' => 'linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(217, 119, 6, 0.03) 100%)', 'border' => 'rgba(217, 119, 6, 0.25)', 'glow' => 'rgba(217, 119, 6, 0.3)']
];
?>

<style>
.genres-hero {
    position: relative;
    padding-top: calc(var(--header-height) + 40px);
    padding-bottom: 20px;
    text-align: center;
    background: linear-gradient(180deg, rgba(229, 9, 20, 0.05) 0%, rgba(6, 7, 12, 0) 100%);
}
.genres-title {
    font-size: 2.8rem;
    font-weight: 800;
    margin-bottom: 12px;
    font-family: var(--font-family-title);
    background: linear-gradient(180deg, #ffffff 0%, #dcdfe9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.genres-subtitle {
    color: var(--text-secondary);
    font-size: 1.05rem;
    max-width: 600px;
    margin: 0 auto 30px;
    font-weight: 500;
}
.genre-tabs {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 40px;
}
.genre-tab-btn {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 12px 28px;
    border-radius: 30px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all var(--transition-medium);
    display: flex;
    align-items: center;
    gap: 8px;
}
.genre-tab-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
    transform: translateY(-2px);
}
.genre-tab-btn.active {
    background: var(--accent-gradient);
    border-color: transparent;
    color: white;
    box-shadow: 0 4px 15px var(--accent-glow);
}
.genre-grid-container {
    display: none;
    animation: fadeInUp 0.4s ease forwards;
}
.genre-grid-container.active {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
}
.premium-genre-card {
    height: 120px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    padding: 20px;
    position: relative;
    overflow: hidden;
    transition: all var(--transition-medium);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}
.premium-genre-card ion-icon {
    font-size: 2.2rem;
    margin-bottom: 8px;
    transition: transform 0.3s ease;
    z-index: 2;
}
.premium-genre-card span {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-primary);
    font-family: var(--font-family-title);
    z-index: 2;
}
.premium-genre-card::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.15;
    background: inherit;
    z-index: 1;
    transition: opacity 0.3s ease;
}
.premium-genre-card:hover {
    transform: translateY(-8px);
    border-color: rgba(255, 255, 255, 0.35);
}
.premium-genre-card:hover ion-icon {
    transform: scale(1.15) rotate(5deg);
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(15px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .genres-title {
        font-size: 2.1rem;
    }
    .genres-subtitle {
        font-size: 0.95rem;
        padding: 0 20px;
    }
    .genre-grid-container.active {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 16px;
    }
    .premium-genre-card {
        height: 100px;
        border-radius: 12px;
    }
    .premium-genre-card ion-icon {
        font-size: 1.8rem;
    }
    .premium-genre-card span {
        font-size: 0.95rem;
    }
}
</style>

<div class="genres-hero">
    <div class="container">
        <h1 class="genres-title">Explore by Genre</h1>
        <p class="genres-subtitle">Choose a genre category to search our extensive list of blockbuster movies and award-winning television series instantly.</p>
        
        <div class="genre-tabs">
            <button class="genre-tab-btn active" onclick="switchGenreTab('movies')">
                <ion-icon name="film-outline"></ion-icon> Movies
            </button>
            <button class="genre-tab-btn" onclick="switchGenreTab('tv')">
                <ion-icon name="tv-outline"></ion-icon> TV Shows
            </button>
        </div>
    </div>
</div>

<div class="container" style="margin-bottom: 60px;">
    <!-- Movies Grid -->
    <div id="moviesGenreGrid" class="genre-grid-container active">
        <?php foreach ($movie_genres_list as $g): ?>
            <a href="<?= $base_path ?>/movies?genre=<?= $g['id'] ?>" class="premium-genre-card" style="background: <?= $g['color'] ?>; border-color: <?= $g['border'] ?>; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), 0 0 10px <?= $g['glow'] ?>;">
                <ion-icon name="<?= $g['icon'] ?>" style="color: <?= $g['icon_color'] ?>;"></ion-icon>
                <span><?= htmlspecialchars($g['name']) ?></span>
            </a>
        <?php endforeach; ?>
    </div>

    <!-- TV Shows Grid -->
    <div id="tvGenreGrid" class="genre-grid-container">
        <?php foreach ($tv_genres_list as $g): ?>
            <a href="<?= $base_path ?>/tv?genre=<?= $g['id'] ?>" class="premium-genre-card" style="background: <?= $g['color'] ?>; border-color: <?= $g['border'] ?>; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), 0 0 10px <?= $g['glow'] ?>;">
                <ion-icon name="<?= $g['icon'] ?>" style="color: <?= $g['icon_color'] ?>;"></ion-icon>
                <span><?= htmlspecialchars($g['name']) ?></span>
            </a>
        <?php endforeach; ?>
    </div>
</div>

<script>
function switchGenreTab(type) {
    // Buttons toggling
    const buttons = document.querySelectorAll('.genre-tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Grids toggling
    const moviesGrid = document.getElementById('moviesGenreGrid');
    const tvGrid = document.getElementById('tvGenreGrid');
    
    moviesGrid.classList.remove('active');
    tvGrid.classList.remove('active');
    
    if (type === 'movies') {
        event.currentTarget.classList.add('active');
        moviesGrid.classList.add('active');
    } else {
        event.currentTarget.classList.add('active');
        tvGrid.classList.add('active');
    }
}
</script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
