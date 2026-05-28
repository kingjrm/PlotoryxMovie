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
        flex-direction: column;
        gap: 10px !important;
    }
    .hero-actions a {
        width: 100%;
        text-align: center;
        justify-content: center;
        margin-left: 0 !important;
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
                        <a href="<?= $base_path ?>/watch?id=<?= $item['id'] ?>&type=<?= $item_type ?>" class="btn btn-primary">
                            <ion-icon name="play-circle" style="font-size: 1.4rem;"></ion-icon> Watch Now
                        </a>
                        <a href="<?= $base_path ?>/details?id=<?= $item['id'] ?>&type=<?= $item_type ?>" class="btn btn-secondary">
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

<div class="container" id="continueWatchingSection" style="display: none;">
    <h2 class="section-title">Continue Watching</h2>
    <div class="movie-grid" id="continueWatchingGrid">
        <!-- JS populated -->
    </div>
</div>

<div class="container">
    <h2 class="section-title">Trending Today</h2>
    <div class="movie-grid">
        <?php 
        if ($trending && isset($trending['results'])) {
            $items = array_slice($trending['results'], 0, 12);
            foreach ($items as $item) {
                include __DIR__ . '/../includes/movie-card.php';
            }
        }
        ?>
    </div>

    <h2 class="section-title">Popular Movies</h2>
    <div class="movie-grid">
        <?php 
        if ($popular_movies && isset($popular_movies['results'])) {
            $items = array_slice($popular_movies['results'], 0, 6);
            foreach ($items as $item) {
                include __DIR__ . '/../includes/movie-card.php';
            }
        }
        ?>
    </div>
    
    <h2 class="section-title">Top Rated TV Shows</h2>
    <div class="movie-grid">
        <?php 
        if ($top_tv && isset($top_tv['results'])) {
            $items = array_slice($top_tv['results'], 0, 6);
            foreach ($items as $item) {
                include __DIR__ . '/../includes/movie-card.php';
            }
        }
        ?>
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
            
            let posterHtml = '';
            if (item.poster) {
                const safePoster = escapeHTML(item.poster);
                posterHtml = `<img loading="lazy" src="${safePoster}" alt="${safeTitle}">`;
            } else {
                posterHtml = `
                    <div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; background:linear-gradient(135deg, #121526 0%, #0c0d16 100%); border-radius:14px; padding:20px; text-align:center;">
                        <ion-icon name="image-outline" style="font-size: 2.5rem; color: rgba(255,255,255,0.1); margin-bottom:10px;"></ion-icon>
                        <div style="font-size: 0.8rem; font-weight:600; color:var(--text-secondary); line-height: 1.3; overflow:hidden; display:-webkit-box; -webkit-line-clamp:3; line-clamp:3; -webkit-box-orient:vertical;">${safeTitle}</div>
                    </div>
                `;
            }
            
            grid.innerHTML += `
                <a href="${link}" class="movie-card">
                    ${posterHtml}
                    <!-- Dynamic resume progress indicator line -->
                    <div style="position:absolute; bottom:0; left:0; width:100%; height:4px; background: rgba(255,255,255,0.1); z-index:4;">
                        <div style="width:65%; height:100%; background:var(--accent-gradient); border-radius: 0 2px 2px 0;"></div>
                    </div>
                    <div class="movie-info">
                        <div class="movie-title">${safeTitle}</div>
                        <div class="movie-meta">
                            <span class="media-type" style="color: #ffb12a !important; font-weight:700;">${episodeInfo}</span>
                            <span style="display:flex; align-items:center; gap:2px; color:white;"><ion-icon name="play" style="font-size:0.8rem;"></ion-icon> Resume</span>
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
});
</script>

<?php include __DIR__ . '/../includes/footer.php'; ?>

