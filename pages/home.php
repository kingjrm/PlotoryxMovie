<?php
require_once __DIR__ . '/../config/tmdb.php';
include __DIR__ . '/../includes/header.php';

// Fetch data
$trending = fetchFromTMDB('/trending/all/day');
$popular_movies = fetchFromTMDB('/movie/popular');
$top_tv = fetchFromTMDB('/tv/top_rated');

// Get top 5 trending items for hero carousel
$heroes = [];
if ($trending && isset($trending['results']) && !empty($trending['results'])) {
    $heroes = array_slice($trending['results'], 0, 5);
}
?>
<style>
.hero {
    position: relative;
    height: 90vh;
    overflow: hidden;
}
.carousel-container {
    width: 100%;
    height: 100%;
    position: relative;
}
.hero-slide {
    position: absolute;
    inset: 0;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    opacity: 0;
    z-index: 1;
    transition: opacity 1s ease-in-out;
}
.hero-slide.active {
    opacity: 1;
    z-index: 2;
}
.hero-slide::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(6, 7, 12, 0.95) 0%, rgba(6, 7, 12, 0.7) 40%, rgba(6, 7, 12, 0) 100%),
                linear-gradient(to top, rgba(6, 7, 12, 1) 0%, rgba(6, 7, 12, 0) 25%);
    z-index: 1;
}
.hero-content {
    position: relative;
    z-index: 3;
    max-width: 650px;
    margin-top: 50px;
}
.carousel-indicators {
    position: absolute;
    bottom: 30px;
    right: 50px;
    display: flex;
    gap: 8px;
    z-index: 10;
}
.carousel-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    border: none;
    cursor: pointer;
    transition: all var(--transition-fast);
}
.carousel-dot.active {
    background: #f5c518;
    transform: scale(1.2);
    box-shadow: 0 0 8px rgba(245, 197, 24, 0.6);
}
.hero-badge {
    background: var(--accent-gradient);
    color: white;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 1px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px var(--accent-glow);
}
.hero-title {
    font-size: 4rem;
    font-weight: 800;
    margin-bottom: 15px;
    line-height: 1.1;
    letter-spacing: -1.5px;
    background: linear-gradient(180deg, #ffffff 0%, #dcdfe9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.hero-meta-info {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
    font-size: 0.95rem;
    font-weight: 600;
}
.hero-meta-info span.rating {
    color: #ffb12a;
    display: flex;
    align-items: center;
    gap: 4px;
}
.hero-meta-info span.year {
    color: var(--text-secondary);
}
.hero-meta-info span.type {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.hero-desc {
    font-size: 1.05rem;
    color: var(--text-secondary);
    margin-bottom: 35px;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.section-title {
    margin-top: 50px;
    margin-bottom: 20px;
    font-size: 1.7rem;
    font-weight: 700;
    letter-spacing: -0.5px;
    position: relative;
    padding-left: 12px;
}
.section-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 15%;
    height: 70%;
    width: 4px;
    background: var(--accent-gradient);
    border-radius: 2px;
}

/* Mobile responsive scaling for homepage */
@media (max-width: 768px) {
    .hero {
        height: 70vh;
        min-height: 480px;
    }
    .hero-content {
        margin-top: 40px;
    }
    .hero-title {
        font-size: 2.2rem !important;
        line-height: 1.2;
    }
    .hero-desc {
        font-size: 0.95rem;
        margin-bottom: 24px;
        line-height: 1.5;
    }
    .hero-badge {
        font-size: 0.72rem;
        padding: 4px 10px;
        margin-bottom: 12px;
    }
    .hero-meta-info {
        font-size: 0.85rem;
        margin-bottom: 14px;
        gap: 10px;
    }
    .section-title {
        font-size: 1.35rem;
        margin-top: 36px;
        margin-bottom: 14px;
    }
    .carousel-indicators {
        bottom: 20px;
        right: 50%;
        transform: translateX(50%);
    }
}

@media (max-width: 480px) {
    .hero {
        height: 62vh;
        min-height: 400px;
    }
    .hero-title {
        font-size: 1.8rem !important;
    }
    .hero-desc {
        display: none; /* Hide descriptions on tiny phone screens for clean buttons display */
    }
    .hero-actions {
        margin-top: 15px;
        display: flex !important;
        flex-direction: row !important;
        gap: 12px !important;
        width: 100%;
        justify-content: flex-start;
    }
    .hero-actions a {
        flex: 1;
        max-width: 150px;
        padding: 8px 16px !important;
        font-size: 0.85rem !important;
        text-align: center;
        justify-content: center;
        border-radius: 6px !important;
        margin-left: 0 !important;
    }
}

/* Netflix Style Hero Buttons */
.netflix-btn-play {
    background: #ffffff !important;
    color: #000000 !important;
    border-radius: 4px !important;
    font-weight: 700 !important;
    padding: 10px 24px !important;
    box-shadow: none !important;
    border: none !important;
    transition: all var(--transition-fast) !important;
    font-size: 0.95rem !important;
    display: inline-flex !important;
    align-items: center;
    gap: 6px;
}
.netflix-btn-play:hover {
    background: rgba(255, 255, 255, 0.75) !important;
    transform: scale(1.02) !important;
}
.netflix-btn-info {
    background: rgba(109, 109, 110, 0.7) !important;
    color: #ffffff !important;
    border-radius: 4px !important;
    font-weight: 700 !important;
    padding: 10px 24px !important;
    border: none !important;
    transition: all var(--transition-fast) !important;
    font-size: 0.95rem !important;
    display: inline-flex !important;
    align-items: center;
    gap: 6px;
}
.netflix-btn-info:hover {
    background: rgba(109, 109, 110, 0.4) !important;
    transform: scale(1.02) !important;
}

/* Netflix Style Category Rows */
.movie-slider-wrapper {
    position: relative;
    margin-bottom: 35px;
    width: 100%;
}
.movie-slider {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    scroll-behavior: smooth;
    padding: 12px 4px 24px;
    scrollbar-width: none; /* Firefox */
}
.movie-slider::-webkit-scrollbar {
    display: none; /* Safari/Chrome */
}
.movie-slider .movie-card {
    flex: 0 0 200px;
    aspect-ratio: 2 / 3;
}
@media (max-width: 768px) {
    .movie-slider .movie-card {
        flex: 0 0 160px;
    }
}
@media (max-width: 480px) {
    .movie-slider .movie-card {
        flex: 0 0 130px;
    }
}
.slider-btn {
    position: absolute;
    top: 12px;
    bottom: 24px;
    width: 45px;
    background: rgba(6, 7, 12, 0.65);
    border: none;
    color: white;
    font-size: 2.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s ease, background 0.3s ease, color 0.3s ease;
    z-index: 10;
    outline: none;
    border-radius: 4px;
}
.movie-slider-wrapper:hover .slider-btn {
    opacity: 1;
}
.slider-btn:hover {
    background: rgba(6, 7, 12, 0.9);
    color: var(--accent);
}
.slider-btn.next {
    right: 0;
}

/* Genre Cards Styling */
.genre-card {
    flex: 0 0 160px;
    height: 75px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
    font-weight: 700;
    font-size: 0.95rem;
    transition: all var(--transition-medium);
    cursor: pointer;
    font-family: var(--font-family-title);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}
.genre-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.4) !important;
}

/* Netflix Style Continue Watching Landscape Cards */
.movie-slider .continue-card {
    flex: 0 0 280px; /* Landscape width */
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    background: #11121d;
    border: 1px solid var(--border-color);
    box-shadow: var(--card-shadow);
    transition: all var(--transition-medium);
}
.movie-slider .continue-card:hover {
    transform: translateY(-5px);
    border-color: var(--accent);
    box-shadow: 0 10px 25px var(--accent-glow);
    z-index: 10;
}
.continue-img-container {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: #000;
}
.continue-img-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-medium);
}
.movie-slider .continue-card:hover .continue-img-container img {
    transform: scale(1.05);
}
.continue-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.25);
    z-index: 5;
}
.continue-progress-fill {
    height: 100%;
    background: var(--accent); /* Crimson progress line */
}
.continue-play-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 4;
}
.movie-slider .continue-card:hover .continue-play-overlay {
    opacity: 1;
}
.continue-play-icon {
    font-size: 2.5rem;
    color: var(--accent);
    filter: drop-shadow(0 2px 8px var(--accent-glow));
    transform: scale(0.85);
    transition: transform 0.3s ease;
}
.movie-slider .continue-card:hover .continue-play-icon {
    transform: scale(1);
}
.continue-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: #11121d;
    border-top: 1px solid rgba(255, 255, 255, 0.03);
}
.continue-text {
    flex: 1;
    min-width: 0;
}
.continue-title {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: var(--font-family-title);
    margin-bottom: 2px;
}
.continue-meta {
    font-size: 0.72rem;
    color: var(--text-secondary);
    font-weight: 600;
}
.continue-actions {
    margin-left: 8px;
    display: flex;
    align-items: center;
}
.continue-btn-play {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.5rem;
    cursor: pointer;
    transition: color 0.2s ease, transform 0.2s ease;
    display: flex;
    align-items: center;
    padding: 0;
}
.continue-btn-play:hover {
    color: var(--accent);
    transform: scale(1.1);
}

/* Roulette Modal Overlay */
.roulette-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(4, 5, 10, 0.85);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.35s ease;
}
.roulette-modal-overlay.active {
    opacity: 1;
    pointer-events: auto;
}
.roulette-modal-container {
    width: 100%;
    max-width: 550px;
    background: rgba(12, 13, 22, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 25px 60px rgba(0,0,0,0.8);
    transform: scale(0.9);
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease;
}
.roulette-modal-overlay.active .roulette-modal-container {
    transform: scale(1);
}
.roulette-modal-overlay.active .roulette-modal-container.reveal-active {
    animation: crimsonFlash 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

@keyframes crimsonFlash {
    0% {
        box-shadow: 0 0 50px rgba(229, 9, 20, 0.8), inset 0 0 20px rgba(229, 9, 20, 0.6);
        border-color: var(--accent);
        transform: scale(1.04);
    }
    100% {
        box-shadow: 0 25px 60px rgba(0,0,0,0.8);
        border-color: rgba(255, 255, 255, 0.08);
        transform: scale(1);
    }
}

/* Shuffling blur effect */
.roulette-modal-container.shuffling .roulette-modal-banner,
.roulette-modal-container.shuffling #rouletteTitle,
.roulette-modal-container.shuffling #rouletteRating,
.roulette-modal-container.shuffling #rouletteBadge {
    filter: blur(4px);
    transform: scale(0.98);
    transition: filter 0.1s ease, transform 0.1s ease;
}

/* Hide description and buttons during shuffle for focus */
.roulette-modal-container.shuffling #rouletteOverview,
.roulette-modal-container.shuffling .roulette-modal-actions {
    opacity: 0.05;
    pointer-events: none;
}

#rouletteOverview,
.roulette-modal-actions {
    transition: opacity 0.4s ease;
}
.roulette-modal-banner {
    width: 100%;
    height: 240px;
    background-size: cover;
    background-position: center;
    position: relative;
}
.roulette-modal-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(12, 13, 22, 1) 0%, rgba(12, 13, 22, 0.4) 60%, rgba(12, 13, 22, 0) 100%);
}
.roulette-modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.2s ease;
    z-index: 10;
}
.roulette-modal-close:hover {
    background: var(--accent);
    border-color: var(--accent);
}
.roulette-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: center;
}

/* Shuffle Banner Redesign */
.shuffle-banner {
    background: linear-gradient(135deg, rgba(20, 22, 37, 0.7) 0%, rgba(12, 13, 22, 0.95) 100%);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.7);
    position: relative;
    overflow: hidden;
}
.shuffle-blur-circle {
    position: absolute;
    top: -60px;
    right: -60px;
    width: 180px;
    height: 180px;
    background: rgba(229, 9, 20, 0.12); /* Accent Red glow */
    filter: blur(60px);
    border-radius: 50%;
    pointer-events: none;
}
.shuffle-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: center;
}
.shuffle-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(229, 9, 20, 0.1);
    color: var(--accent);
    padding: 6px 16px;
    border-radius: 30px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 15px;
    border: 1px solid rgba(229, 9, 20, 0.15);
    width: fit-content;
}
.pulse-dot {
    width: 6px;
    height: 6px;
    background-color: var(--accent);
    border-radius: 50%;
    box-shadow: 0 0 0 0 rgba(229, 9, 20, 0.7);
    animation: shuffle-pulse 1.6s infinite;
}
@keyframes shuffle-pulse {
    0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(229, 9, 20, 0.7);
    }
    70% {
        transform: scale(1);
        box-shadow: 0 0 0 6px rgba(229, 9, 20, 0);
    }
    100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(229, 9, 20, 0);
    }
}
.shuffle-title {
    font-size: 2.2rem;
    font-weight: 800;
    margin-top: 0;
    margin-bottom: 12px;
    font-family: var(--font-family-title);
    background: linear-gradient(180deg, #ffffff 0%, #dcdfe9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.shuffle-desc {
    color: var(--text-secondary);
    line-height: 1.7;
    font-size: 0.98rem;
    margin-bottom: 0;
}
.shuffle-form-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.03);
    padding: 30px;
    border-radius: 16px;
}
.shuffle-form-row {
    display: flex;
    gap: 15px;
}
.shuffle-field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
}
.shuffle-field label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 5px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.shuffle-field label ion-icon {
    font-size: 0.95rem;
    color: var(--accent);
}
.shuffle-field select {
    background: #11121d;
    border: 1px solid var(--border-color);
    color: white;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    outline: none;
    cursor: pointer;
    width: 100%;
    transition: all var(--transition-fast);
}
.shuffle-field select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 10px rgba(229, 9, 20, 0.15);
}
.shuffle-btn {
    background: var(--accent-gradient);
    border: none;
    color: white;
    padding: 14px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all var(--transition-medium);
    box-shadow: 0 4px 15px var(--accent-glow);
}
.shuffle-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(229, 9, 20, 0.4);
}
.shuffle-btn ion-icon {
    font-size: 1.35rem;
}

@media (max-width: 992px) {
    .shuffle-container {
        grid-template-columns: 1fr;
        gap: 30px;
    }
}
@media (max-width: 576px) {
    .shuffle-banner {
        padding: 24px;
    }
    .shuffle-form-wrapper {
        padding: 20px;
    }
    .shuffle-form-row {
        flex-direction: column;
        gap: 15px;
    }
    .shuffle-title {
        font-size: 1.7rem;
    }
    .shuffle-desc {
        font-size: 0.9rem;
    }
}
</style>


<div class="hero">
    <div class="carousel-container">
        <?php foreach ($heroes as $index => $item): 
            $item_bg = isset($item['backdrop_path']) 
                ? $config['TMDB_IMAGE_BASE_URL'] . 'original' . $item['backdrop_path'] 
                : $base_path . '/assets/images/hero-fallback.jpg';
            $item_title = $item['title'] ?? ($item['name'] ?? 'Untitled');
            $item_overview = $item['overview'] ?? 'No description available.';
            $item_rating = isset($item['vote_average']) ? round($item['vote_average'], 1) : '';
            $item_date = $item['release_date'] ?? ($item['first_air_date'] ?? '');
            $item_year = !empty($item_date) ? substr($item_date, 0, 4) : '';
            $item_type = $item['media_type'] ?? (isset($item['title']) ? 'movie' : 'tv');
        ?>
            <div class="hero-slide <?= $index === 0 ? 'active' : '' ?>" style="background-image: url('<?= $item_bg ?>');">
                <div class="container hero-content">
                    <div class="hero-badge">
                        <ion-icon name="flame"></ion-icon> TRENDING TODAY
                    </div>
                    <h1 class="hero-title"><?= htmlspecialchars($item_title) ?></h1>
                    <div class="hero-meta-info">
                        <?php if ($item_rating): ?>
                            <span class="rating"><ion-icon name="star"></ion-icon> <?= $item_rating ?></span>
                        <?php endif; ?>
                        <?php if ($item_year): ?>
                            <span class="year"><?= $item_year ?></span>
                        <?php endif; ?>
                        <span class="type"><?= $item_type === 'movie' ? 'Movie' : 'TV Series' ?></span>
                    </div>
                    <p class="hero-desc"><?= htmlspecialchars($item_overview) ?></p>
                    <div class="hero-actions" style="display: flex; gap: 15px;">
                        <?php if($item['id']): ?>
                        <a href="<?= $base_path ?>/watch?id=<?= $item['id'] ?>&type=<?= $item_type ?>" class="btn netflix-btn-play">
                            <ion-icon name="play" style="font-size: 1.4rem;"></ion-icon> Play
                        </a>
                        <a href="<?= $base_path ?>/details?id=<?= $item['id'] ?>&type=<?= $item_type ?>" class="btn netflix-btn-info">
                            <ion-icon name="information-circle-outline" style="font-size: 1.4rem;"></ion-icon> More Info
                        </a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
    
    <div class="carousel-indicators">
        <?php foreach ($heroes as $index => $item): ?>
            <button class="carousel-dot <?= $index === 0 ? 'active' : '' ?>" onclick="goToSlide(<?= $index ?>)"></button>
        <?php endforeach; ?>
    </div>
</div>

<div class="container" id="continueWatchingSection" style="display: none; padding-top: 10px;">
    <h2 class="section-title">Continue Watching</h2>
    <div class="movie-slider-wrapper">
        <button class="slider-btn prev" aria-label="Slide Left"><ion-icon name="chevron-back-outline"></ion-icon></button>
        <div class="movie-slider" id="continueWatchingGrid">
            <!-- JS populated -->
        </div>
        <button class="slider-btn next" aria-label="Slide Right"><ion-icon name="chevron-forward-outline"></ion-icon></button>
    </div>
</div>

<!-- Popular Genres Section -->
<div class="container" style="margin-top: 30px;">
    <h2 class="section-title">Popular Genres</h2>
    <div style="display: flex; gap: 14px; overflow-x: auto; padding: 10px 4px 20px; scrollbar-width: none; -ms-overflow-style: none;">
        <a href="<?= $base_path ?>/movies?genre=28" class="genre-card" style="background: linear-gradient(135deg, rgba(229, 9, 20, 0.15) 0%, rgba(229, 9, 20, 0.02) 100%); border-color: rgba(229, 9, 20, 0.2);">
            <ion-icon name="flame-outline" style="font-size:1.5rem; color:#e50914; margin-right:8px;"></ion-icon>
            <span>Action</span>
        </a>
        <a href="<?= $base_path ?>/movies?genre=35" class="genre-card" style="background: linear-gradient(135deg, rgba(245, 197, 24, 0.15) 0%, rgba(245, 197, 24, 0.02) 100%); border-color: rgba(245, 197, 24, 0.2);">
            <ion-icon name="happy-outline" style="font-size:1.5rem; color:#f5c518; margin-right:8px;"></ion-icon>
            <span>Comedy</span>
        </a>
        <a href="<?= $base_path ?>/movies?genre=878" class="genre-card" style="background: linear-gradient(135deg, rgba(26, 115, 232, 0.15) 0%, rgba(26, 115, 232, 0.02) 100%); border-color: rgba(26, 115, 232, 0.2);">
            <ion-icon name="planet-outline" style="font-size:1.5rem; color:#1a73e8; margin-right:8px;"></ion-icon>
            <span>Sci-Fi</span>
        </a>
        <a href="<?= $base_path ?>/movies?genre=18" class="genre-card" style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.02) 100%); border-color: rgba(168, 85, 247, 0.2);">
            <ion-icon name="sad-outline" style="font-size:1.5rem; color:#a855f7; margin-right:8px;"></ion-icon>
            <span>Drama</span>
        </a>
        <a href="<?= $base_path ?>/movies?genre=53" class="genre-card" style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0.02) 100%); border-color: rgba(236, 72, 153, 0.2);">
            <ion-icon name="skull-outline" style="font-size:1.5rem; color:#ec4899; margin-right:8px;"></ion-icon>
            <span>Thriller</span>
        </a>
        <a href="<?= $base_path ?>/movies?genre=27" class="genre-card" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.02) 100%); border-color: rgba(239, 68, 68, 0.2);">
            <ion-icon name="thunderstorm-outline" style="font-size:1.5rem; color:#ef4444; margin-right:8px;"></ion-icon>
            <span>Horror</span>
        </a>
        <a href="<?= $base_path ?>/movies?genre=10749" class="genre-card" style="background: linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(244, 63, 94, 0.02) 100%); border-color: rgba(244, 63, 94, 0.2);">
            <ion-icon name="heart-outline" style="font-size:1.5rem; color:#f43f5e; margin-right:8px;"></ion-icon>
            <span>Romance</span>
        </a>
        <a href="<?= $base_path ?>/movies?genre=16" class="genre-card" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.02) 100%); border-color: rgba(16, 185, 129, 0.2);">
            <ion-icon name="color-palette-outline" style="font-size:1.5rem; color:#10b981; margin-right:8px;"></ion-icon>
            <span>Animation</span>
        </a>
    </div>
</div>

<!-- Surprise Me (Movie Roulette) Section -->
<div class="container" style="margin-top: 40px; margin-bottom: 40px;">
    <div class="shuffle-banner">
        <div class="shuffle-blur-circle"></div>
        <div class="shuffle-container">
            <div class="shuffle-info">
                <div class="shuffle-badge">
                    <span class="pulse-dot"></span>
                    <span>Plotoryx Shuffle</span>
                </div>
                <h2 class="shuffle-title">Can't decide what to watch?</h2>
                <p class="shuffle-desc">Select your mood filters and let our system find the perfect movie or television series recommendation instantly!</p>
            </div>
            
            <div class="shuffle-form-wrapper">
                <div class="shuffle-form-row">
                    <div class="shuffle-field">
                        <label><ion-icon name="videocam-outline"></ion-icon> Type</label>
                        <select id="rouletteType">
                            <option value="movie">Movies</option>
                            <option value="tv">TV Shows</option>
                        </select>
                    </div>
                    <div class="shuffle-field">
                        <label><ion-icon name="options-outline"></ion-icon> Genre</label>
                        <select id="rouletteGenre">
                            <option value="">All Genres</option>
                            <option value="28">Action</option>
                            <option value="12">Adventure</option>
                            <option value="16">Animation</option>
                            <option value="35">Comedy</option>
                            <option value="80">Crime</option>
                            <option value="18">Drama</option>
                            <option value="27">Horror</option>
                            <option value="9648">Mystery</option>
                            <option value="10749">Romance</option>
                            <option value="878">Sci-Fi</option>
                            <option value="53">Thriller</option>
                        </select>
                    </div>
                </div>
                
                <button id="shuffleBtn" class="shuffle-btn">
                    <ion-icon name="shuffle-outline"></ion-icon> <span>Surprise Me</span>
                </button>
            </div>
        </div>
    </div>
</div>

<div class="container">
    <h2 class="section-title">Trending Today</h2>
    <div class="movie-slider-wrapper">
        <button class="slider-btn prev" aria-label="Slide Left"><ion-icon name="chevron-back-outline"></ion-icon></button>
        <div class="movie-slider">
            <?php 
            if ($trending && isset($trending['results'])) {
                $items = array_slice($trending['results'], 0, 18);
                foreach ($items as $item) {
                    include __DIR__ . '/../includes/movie-card.php';
                }
            }
            ?>
        </div>
        <button class="slider-btn next" aria-label="Slide Right"><ion-icon name="chevron-forward-outline"></ion-icon></button>
    </div>

    <h2 class="section-title">Popular Movies</h2>
    <div class="movie-slider-wrapper">
        <button class="slider-btn prev" aria-label="Slide Left"><ion-icon name="chevron-back-outline"></ion-icon></button>
        <div class="movie-slider">
            <?php 
            if ($popular_movies && isset($popular_movies['results'])) {
                $items = array_slice($popular_movies['results'], 0, 18);
                foreach ($items as $item) {
                    include __DIR__ . '/../includes/movie-card.php';
                }
            }
            ?>
        </div>
        <button class="slider-btn next" aria-label="Slide Right"><ion-icon name="chevron-forward-outline"></ion-icon></button>
    </div>
    
    <h2 class="section-title">Top Rated TV Shows</h2>
    <div class="movie-slider-wrapper">
        <button class="slider-btn prev" aria-label="Slide Left"><ion-icon name="chevron-back-outline"></ion-icon></button>
        <div class="movie-slider">
            <?php 
            if ($top_tv && isset($top_tv['results'])) {
                $items = array_slice($top_tv['results'], 0, 18);
                foreach ($items as $item) {
                    include __DIR__ . '/../includes/movie-card.php';
                }
            }
            ?>
        </div>
        <button class="slider-btn next" aria-label="Slide Right"><ion-icon name="chevron-forward-outline"></ion-icon></button>
    </div>
</div>

<script>
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

document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('continueWatchingSection');
    const grid = document.getElementById('continueWatchingGrid');
    const continueList = JSON.parse(localStorage.getItem('continueWatching')) || [];
    
    if (continueList.length > 0) {
        section.style.display = 'block';
        grid.innerHTML = '';
        
        continueList.forEach(item => {
            const isTV = item.type === 'tv';
            const episodeInfo = escapeHTML(isTV ? `S${item.season} Ep${item.episode}` : 'Movie');
            const safeId = escapeHTML(item.id);
            const safeType = escapeHTML(item.type);
            const safeSeason = escapeHTML(item.season);
            const safeEpisode = escapeHTML(item.episode);
            const safeTitle = escapeHTML(item.title);
            
            const link = `<?= $base_path ?>/watch?id=${safeId}&type=${safeType}` + (isTV ? `&season=${safeSeason}&episode=${safeEpisode}` : '');
            
            // Use backdrop image for landscape style card, fallback to poster
            const cardImgSrc = item.backdrop ? item.backdrop : (item.poster ? item.poster : '');
            let imgHtml = '';
            
            if (cardImgSrc) {
                const safeImg = escapeHTML(cardImgSrc);
                imgHtml = `<img loading="lazy" src="${safeImg}" alt="${safeTitle}">`;
            } else {
                imgHtml = `
                    <div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; background:linear-gradient(135deg, #121526 0%, #0c0d16 100%); padding:20px; text-align:center;">
                        <ion-icon name="image-outline" style="font-size: 2.5rem; color: rgba(255,255,255,0.1); margin-bottom:10px;"></ion-icon>
                        <div style="font-size: 0.8rem; font-weight:600; color:var(--text-secondary); line-height: 1.3; overflow:hidden; display:-webkit-box; -webkit-line-clamp:3; line-clamp:3; -webkit-box-orient:vertical;">${safeTitle}</div>
                    </div>
                `;
            }
            
            // Generate a persistent progress bar length based on the item ID
            const progress = (parseInt(item.id) % 55) + 25; // between 25% and 80%
            
            grid.innerHTML += `
                <a href="${link}" class="continue-card">
                    <div class="continue-img-container">
                        ${imgHtml}
                        <!-- Play hover overlay -->
                        <div class="continue-play-overlay">
                            <ion-icon name="play-circle-outline" class="continue-play-icon"></ion-icon>
                        </div>
                        <!-- Progress bar line -->
                        <div class="continue-progress-bar">
                            <div class="continue-progress-fill" style="width: ${progress}%;"></div>
                        </div>
                    </div>
                    <!-- Details below thumbnail -->
                    <div class="continue-details">
                        <div class="continue-text">
                            <div class="continue-title" title="${safeTitle}">${safeTitle}</div>
                            <div class="continue-meta">${episodeInfo}</div>
                        </div>
                        <div class="continue-actions">
                            <button class="continue-btn-play" aria-label="Play">
                                <ion-icon name="play-circle"></ion-icon>
                            </button>
                        </div>
                    </div>
                </a>
            `;
        });
    }

    // Carousel slideshow logic
    let currentSlideIndex = 0;
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    let carouselInterval = null;

    window.showSlide = function(index) {
        if (slides.length === 0) return;
        
        // Deactivate current slide
        slides[currentSlideIndex].classList.remove('active');
        dots[currentSlideIndex].classList.remove('active');
        
        // Activate new slide
        currentSlideIndex = index;
        if (currentSlideIndex >= slides.length) currentSlideIndex = 0;
        if (currentSlideIndex < 0) currentSlideIndex = slides.length - 1;
        
        slides[currentSlideIndex].classList.add('active');
        dots[currentSlideIndex].classList.add('active');
    }

    window.goToSlide = function(index) {
        window.showSlide(index);
        resetInterval();
    }

    function nextSlide() {
        window.showSlide(currentSlideIndex + 1);
    }

    function startInterval() {
        carouselInterval = setInterval(nextSlide, 6000); // 6 seconds slide interval
    }

    function resetInterval() {
        clearInterval(carouselInterval);
        startInterval();
    }

    if (slides.length > 0) {
        startInterval();
    }

    // Netflix-style Horizontal Slider scroll controllers
    document.querySelectorAll('.movie-slider-wrapper').forEach(wrapper => {
        const slider = wrapper.querySelector('.movie-slider');
        const prevBtn = wrapper.querySelector('.slider-btn.prev');
        const nextBtn = wrapper.querySelector('.slider-btn.next');
        
        if (slider && prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                slider.scrollBy({ left: -600, behavior: 'smooth' });
            });
            nextBtn.addEventListener('click', () => {
                slider.scrollBy({ left: 600, behavior: 'smooth' });
            });
            
            // Show/hide arrows based on scroll state
            const updateArrows = () => {
                const maxScroll = slider.scrollWidth - slider.clientWidth;
                prevBtn.style.opacity = slider.scrollLeft <= 5 ? '0' : '1';
                prevBtn.style.pointerEvents = slider.scrollLeft <= 5 ? 'none' : 'auto';
                nextBtn.style.opacity = slider.scrollLeft >= maxScroll - 5 ? '0' : '1';
                nextBtn.style.pointerEvents = slider.scrollLeft >= maxScroll - 5 ? 'none' : 'auto';
            };
            
            slider.addEventListener('scroll', updateArrows);
            window.addEventListener('resize', updateArrows);
            
            // Wait slightly for content render to calculate arrow visibility
            setTimeout(updateArrows, 600);
        }
    });

    // Surprise Me (Movie Roulette) JS Logic
    const shuffleBtn = document.getElementById('shuffleBtn');
    const rouletteModal = document.getElementById('rouletteModal');
    const closeRouletteBtn = document.getElementById('closeRouletteBtn');
    const rouletteReshuffleBtn = document.getElementById('rouletteReshuffleBtn');
    
    const typeSelect = document.getElementById('rouletteType');
    const genreSelect = document.getElementById('rouletteGenre');
    
    const rouletteBanner = document.getElementById('rouletteBanner');
    const rouletteBadge = document.getElementById('rouletteBadge');
    const rouletteRating = document.getElementById('rouletteRating');
    const rouletteTitle = document.getElementById('rouletteTitle');
    const rouletteOverview = document.getElementById('rouletteOverview');
    const rouletteWatchLink = document.getElementById('rouletteWatchLink');
    
    async function triggerRoulette() {
        if (!shuffleBtn) return;
        
        // Show loading state on shuffle button
        const originalBtnContent = shuffleBtn.innerHTML;
        shuffleBtn.disabled = true;
        shuffleBtn.innerHTML = `<ion-icon name="sync-outline" class="spin spin-icon" style="font-size:1.20rem; margin-right:6px;"></ion-icon> Shuffling...`;
        
        const type = typeSelect.value || 'movie';
        let genre = genreSelect.value || '';
        
        // Map TMDB movie-only genre IDs to TV-equivalent IDs when TV shows are selected
        if (type === 'tv') {
            if (genre === '28' || genre === '12') {
                genre = '10759'; // Action & Adventure
            } else if (genre === '878') {
                genre = '10765'; // Sci-Fi & Fantasy
            }
        }
        
        const randomPage = Math.floor(Math.random() * 10) + 1; // page 1 to 10 for more variety
        const apiPath = `${window.basePath || ''}/api/discover.php?type=${type}&genre=${genre}&page=${randomPage}`;
        
        try {
            const res = await fetch(apiPath);
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            const results = data.results || [];
            
            if (results.length > 0) {
                // Pick random item as the final winner
                const item = results[Math.floor(Math.random() * results.length)];
                const desc = item.overview || 'No overview description available.';
                const detailUrl = `${window.basePath || ''}/watch?id=${item.id}&type=${type}`;
                
                // Prepare container
                const container = rouletteModal.querySelector('.roulette-modal-container');
                container.classList.remove('reveal-active');
                container.classList.add('shuffling');
                
                // Show modal immediately with first result
                updateModalContent(results[0]);
                rouletteModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                let cycleIndex = 0;
                const totalFastCycles = 12; // 12 cycles at 100ms
                const cycleDelay = 100;
                
                function runCycle() {
                    if (cycleIndex < totalFastCycles) {
                        const tempItem = results[Math.floor(Math.random() * results.length)];
                        updateModalContent(tempItem);
                        cycleIndex++;
                        setTimeout(runCycle, cycleDelay);
                    } else if (cycleIndex === totalFastCycles) {
                        const tempItem = results[Math.floor(Math.random() * results.length)];
                        updateModalContent(tempItem);
                        cycleIndex++;
                        setTimeout(runCycle, 150);
                    } else if (cycleIndex === totalFastCycles + 1) {
                        const tempItem = results[Math.floor(Math.random() * results.length)];
                        updateModalContent(tempItem);
                        cycleIndex++;
                        setTimeout(runCycle, 250);
                    } else if (cycleIndex === totalFastCycles + 2) {
                        const tempItem = results[Math.floor(Math.random() * results.length)];
                        updateModalContent(tempItem);
                        cycleIndex++;
                        setTimeout(runCycle, 400);
                    } else {
                        // Reveal final result
                        updateModalContent(item);
                        rouletteOverview.textContent = desc;
                        rouletteWatchLink.href = detailUrl;
                        
                        container.classList.remove('shuffling');
                        container.offsetWidth; // force reflow
                        container.classList.add('reveal-active');
                    }
                }
                
                function updateModalContent(tempItem) {
                    const tempTitleText = tempItem.title || tempItem.name || 'Untitled';
                    const tempBackdrop = tempItem.backdrop_path 
                        ? `https://image.tmdb.org/t/p/w780${tempItem.backdrop_path}`
                        : `${window.basePath || ''}/assets/images/hero-fallback.jpg`;
                    const tempRating = tempItem.vote_average ? tempItem.vote_average.toFixed(1) : 'N/A';
                    
                    rouletteBanner.style.backgroundImage = `url('${tempBackdrop}')`;
                    rouletteBadge.textContent = type === 'movie' ? 'Movie' : 'TV Series';
                    rouletteRating.innerHTML = `<ion-icon name="star"></ion-icon> ${tempRating}`;
                    rouletteTitle.textContent = tempTitleText;
                }
                
                // Start animation cycle
                setTimeout(runCycle, cycleDelay);
            } else {
                alert('No titles found for the selected filters. Try another genre!');
            }
        } catch (e) {
            console.error(e);
            alert('Roulette failed to fetch. Please try again!');
        } finally {
            // Restore button content
            shuffleBtn.disabled = false;
            shuffleBtn.innerHTML = originalBtnContent;
        }
    }
    
    if (shuffleBtn && rouletteModal) {
        shuffleBtn.addEventListener('click', triggerRoulette);
        rouletteReshuffleBtn.addEventListener('click', triggerRoulette);
        
        const closeRoulette = () => {
            rouletteModal.classList.remove('active');
            document.body.style.overflow = '';
        };
        
        closeRouletteBtn.addEventListener('click', closeRoulette);
        rouletteModal.addEventListener('click', (e) => {
            if (e.target === rouletteModal) {
                closeRoulette();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && rouletteModal.classList.contains('active')) {
                closeRoulette();
            }
        });
    }
});
</script>

<!-- Roulette Result Modal Overlay -->
<div class="roulette-modal-overlay" id="rouletteModal">
    <div class="roulette-modal-container">
        <button class="roulette-modal-close" id="closeRouletteBtn" aria-label="Close random choice">
            <ion-icon name="close-outline"></ion-icon>
        </button>
        
        <div class="roulette-modal-banner" id="rouletteBanner" style="background-image: url('');">
            <div class="roulette-modal-gradient"></div>
        </div>
        
        <div class="roulette-modal-content" style="padding: 28px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span id="rouletteBadge" style="background: var(--accent-gradient); color:white; padding:3px 10px; border-radius:4px; font-size:0.7rem; font-weight:700; letter-spacing:0.5px; text-transform:uppercase;">Movie</span>
                <span id="rouletteRating" style="color:#ffb12a; font-weight:700; display:flex; align-items:center; gap:3px; font-size:0.9rem;"><ion-icon name="star"></ion-icon> 8.2</span>
            </div>
            <h2 id="rouletteTitle" style="font-size: 1.8rem; font-weight:800; margin-bottom:12px; font-family:var(--font-family-title); line-height:1.2;">Title</h2>
            <p id="rouletteOverview" style="color:var(--text-secondary); font-size:0.9rem; line-height:1.6; margin-bottom:24px; display:-webkit-box; -webkit-line-clamp:4; line-clamp:4; -webkit-box-orient:vertical; overflow:hidden;">Description</p>
            
            <div class="roulette-modal-actions" style="display:flex; gap:12px;">
                <a id="rouletteWatchLink" href="" class="btn btn-primary" style="flex:1; border-radius:8px; padding:12px; font-weight:700; text-align:center; justify-content:center;">
                    <ion-icon name="play" style="font-size:1.2rem; margin-right:4px;"></ion-icon> Watch Now
                </a>
                <button id="rouletteReshuffleBtn" class="btn btn-secondary" style="flex:1; border-radius:8px; padding:12px; font-weight:700; text-align:center; justify-content:center;">
                    <ion-icon name="refresh-outline" style="font-size:1.2rem; margin-right:4px;"></ion-icon> Shuffle Again
                </button>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>

