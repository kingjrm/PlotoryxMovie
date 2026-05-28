<?php
require_once __DIR__ . '/../config/tmdb.php';

$id = $_GET['id'] ?? null;
$type = $_GET['type'] ?? 'movie';

if (!$id) {
    header("Location: {$config['BASE_URL']}/");
    exit;
}

$details = fetchFromTMDB("/$type/$id", ['append_to_response' => 'credits,videos,recommendations']);

if (!$details) {
    echo "Item not found.";
    exit;
}

include __DIR__ . '/../includes/header.php';

$backdrop_path = isset($details['backdrop_path']) ? $config['TMDB_IMAGE_BASE_URL'] . 'original' . $details['backdrop_path'] : '';
$poster_path = isset($details['poster_path']) ? $config['TMDB_IMAGE_BASE_URL'] . 'w500' . $details['poster_path'] : '';
$title = $details['title'] ?? $details['name'] ?? 'Unknown';
$release_date = $details['release_date'] ?? $details['first_air_date'] ?? '';
$year = substr($release_date, 0, 4);
$runtime = $details['runtime'] ?? ($details['episode_run_time'][0] ?? null);
?>

<style>
.details-hero {
    position: relative;
    padding-top: 140px;
    padding-bottom: 60px;
    background: url('<?= $backdrop_path ?>') center/cover no-repeat;
    background-attachment: fixed;
    min-height: 85vh;
    display: flex;
    align-items: center;
}
.details-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(6,7,12,0.98) 0%, rgba(6,7,12,0.85) 50%, rgba(6,7,12,0.4) 100%),
                linear-gradient(to top, var(--bg-main) 0%, rgba(6,7,12,0) 25%);
}
.details-content {
    position: relative;
    z-index: 2;
    display: flex;
    gap: 48px;
    align-items: center;
}
.poster-container {
    flex: 0 0 320px;
    max-width: 320px;
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 15px 40px rgba(0,0,0,0.8);
    border: 1px solid rgba(255,255,255,0.08);
}
.poster-container img {
    width: 100%;
    display: block;
    transition: transform var(--transition-medium);
}
.poster-container:hover img {
    transform: scale(1.03);
}
.info-container {
    flex: 1;
    min-width: 300px;
}
.info-title {
    font-size: 3.2rem;
    line-height: 1.1;
    margin-bottom: 12px;
    letter-spacing: -1.5px;
    background: linear-gradient(180deg, #ffffff 0%, #dcdfe9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.info-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    color: var(--text-secondary);
    margin-bottom: 24px;
    align-items: center;
    font-weight: 600;
}
.info-meta span.rating {
    color: #ffb12a;
    display: flex;
    align-items: center;
    gap: 4px;
}
.genres {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
.genre-tag {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.05);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    color: var(--text-primary);
}
.tagline {
    font-style: italic;
    color: #9ea2c0;
    margin-bottom: 24px;
    font-size: 1.1rem;
    border-left: 3px solid var(--accent);
    padding-left: 12px;
}
.overview-title {
    font-size: 1.25rem;
    margin-bottom: 10px;
    color: var(--text-primary);
}
.overview {
    line-height: 1.7;
    margin-bottom: 35px;
    color: var(--text-secondary);
    font-size: 1.02rem;
}
.action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
}

/* Cast, Trailer, Recommendations Tabs */
.tabs-container {
    margin-top: 60px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    gap: 30px;
    margin-bottom: 30px;
}
.tab-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.1rem;
    font-weight: 700;
    padding-bottom: 12px;
    cursor: pointer;
    position: relative;
    transition: color var(--transition-fast);
}
.tab-btn:hover {
    color: var(--text-primary);
}
.tab-btn.active {
    color: var(--text-primary);
}
.tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background: var(--accent-gradient);
    border-radius: 3px;
}
.tab-content {
    display: none;
    animation: fadeIn 0.4s ease;
}
.tab-content.active {
    display: block;
}

.cast-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 20px;
}
.actor-card {
    text-align: center;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 12px;
    transition: all var(--transition-fast);
}
.actor-card:hover {
    transform: translateY(-5px);
    border-color: var(--border-color-hover);
    box-shadow: var(--card-shadow);
}
.actor-img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border-radius: 50%;
    margin-bottom: 10px;
    border: 2px solid rgba(255,255,255,0.05);
}

.trailer-wrapper {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 */
    height: 0;
    overflow: hidden;
    border-radius: 16px;
    box-shadow: var(--card-shadow);
    border: 1px solid var(--border-color);
}
.trailer-wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 992px) {
    .details-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    .poster-container {
        flex: 0 0 240px;
        max-width: 240px;
        margin: 0 auto;
    }
    .info-title {
        font-size: 2.2rem;
        margin-top: 15px;
    }
    .info-meta {
        justify-content: center;
    }
    .action-buttons {
        justify-content: center;
    }
    .tagline {
        border-left: none;
        border-top: 2px solid var(--accent);
        border-bottom: 2px solid var(--accent);
        padding: 8px 0;
        text-align: center;
    }
}

@media (max-width: 576px) {
    .details-hero {
        padding-top: 100px;
        padding-bottom: 30px;
    }
    .info-title {
        font-size: 1.7rem !important;
    }
    .info-meta {
        font-size: 0.82rem;
        gap: 8px;
    }
    .genre-tag {
        font-size: 0.72rem;
        padding: 2px 8px;
    }
    .tagline {
        font-size: 0.95rem;
    }
    .overview {
        font-size: 0.9rem;
        line-height: 1.6;
    }
    .action-buttons {
        flex-direction: column;
        width: 100%;
        gap: 10px;
    }
    .action-buttons .btn {
        width: 100%;
        text-align: center;
    }
    .tabs-container {
        margin-top: 40px;
        gap: 16px;
        margin-bottom: 20px;
    }
    .tab-btn {
        font-size: 0.92rem;
        padding-bottom: 8px;
    }
    .cast-grid {
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
        gap: 12px;
    }
    .actor-card {
        padding: 8px;
        border-radius: 8px;
    }
    .actor-img {
        margin-bottom: 6px;
    }
}
</style>


<div class="details-hero">
    <div class="container details-content">
        <div class="poster-container">
            <?php if ($poster_path): ?>
                <img src="<?= $poster_path ?>" alt="<?= htmlspecialchars($title) ?>">
            <?php else: ?>
                <div style="width:320px; height:480px; display:flex; flex-direction:column; justify-content:center; align-items:center; background:linear-gradient(135deg, #121526 0%, #0c0d16 100%);">
                    <ion-icon name="image-outline" style="font-size: 4rem; color: rgba(255,255,255,0.1); margin-bottom:15px;"></ion-icon>
                    <span style="color:var(--text-secondary); font-weight:600;"><?= htmlspecialchars($title) ?></span>
                </div>
            <?php endif; ?>
        </div>
        <div class="info-container">
            <h1 class="info-title"><?= htmlspecialchars($title) ?> <?= $year ? "($year)" : "" ?></h1>
            <div class="info-meta">
                <span class="rating"><ion-icon name="star"></ion-icon> <?= round($details['vote_average'], 1) ?></span>
                <?php if ($runtime): ?>
                    <span><ion-icon name="time-outline" style="vertical-align: middle; margin-right: 4px;"></ion-icon><?= $runtime ?> min</span>
                <?php endif; ?>
                <div class="genres">
                    <?php foreach ($details['genres'] as $genre): ?>
                        <span class="genre-tag"><?= htmlspecialchars($genre['name']) ?></span>
                    <?php endforeach; ?>
                </div>
            </div>
            
            <?php if (!empty($details['tagline'])): ?>
                <p class="tagline">"<?= htmlspecialchars($details['tagline']) ?>"</p>
            <?php endif; ?>
            
            <h3 class="overview-title">Overview</h3>
            <p class="overview"><?= htmlspecialchars($details['overview']) ?></p>
            
            <div class="action-buttons">
                <a href="<?= $base_path ?>/watch?id=<?= htmlspecialchars($id) ?>&type=<?= htmlspecialchars($type) ?>" class="btn btn-primary">
                    <ion-icon name="play-circle" style="font-size: 1.4rem;"></ion-icon> Watch Now
                </a>
                <button id="addWatchlist" class="btn btn-secondary" data-id="<?= htmlspecialchars($id) ?>" data-type="<?= htmlspecialchars($type) ?>" data-title="<?= htmlspecialchars($title) ?>" data-poster="<?= htmlspecialchars($poster_path) ?>">
                    <ion-icon name="add"></ion-icon> <span>Add to Watchlist</span>
                </button>
            </div>
        </div>
    </div>
</div>

<div class="container">
    <?php
    // Find YouTube Trailer
    $trailer_key = '';
    if (isset($details['videos']['results'])) {
        foreach ($details['videos']['results'] as $video) {
            if ($video['site'] === 'YouTube' && ($video['type'] === 'Trailer' || $video['type'] === 'Teaser')) {
                $trailer_key = $video['key'];
                break;
            }
        }
    }
    
    // Recommendations
    $recs = $details['recommendations']['results'] ?? [];
    ?>

    <div class="tabs-container">
        <button class="tab-btn active" onclick="switchTab('castTab', this)">Cast</button>
        <?php if ($trailer_key): ?>
            <button class="tab-btn" onclick="switchTab('trailerTab', this)">Official Trailer</button>
        <?php endif; ?>
        <?php if (!empty($recs)): ?>
            <button class="tab-btn" onclick="switchTab('recsTab', this)">More Like This</button>
        <?php endif; ?>
    </div>

    <!-- Cast Tab -->
    <div id="castTab" class="tab-content active">
        <div class="cast-grid">
            <?php 
            $cast = array_slice($details['credits']['cast'] ?? [], 0, 8);
            if (empty($cast)):
                echo "<p style='color: var(--text-secondary);'>No cast information available.</p>";
            endif;
            foreach ($cast as $actor):
                $actor_img = $actor['profile_path'] ? $config['TMDB_IMAGE_BASE_URL'] . 'w185' . $actor['profile_path'] : '';
            ?>
                <div class="actor-card">
                    <?php if ($actor_img): ?>
                        <img class="actor-img" src="<?= $actor_img ?>" alt="<?= htmlspecialchars($actor['name']) ?>">
                    <?php else: ?>
                        <!-- Initials placeholder -->
                        <div class="actor-img" style="display:flex; justify-content:center; align-items:center; background: #161827; color: var(--text-secondary); font-weight:700; font-size:1.2rem;">
                            <?= substr($actor['name'], 0, 1) ?>
                        </div>
                    <?php endif; ?>
                    <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"><?= htmlspecialchars($actor['name']) ?></div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px;"><?= htmlspecialchars($actor['character']) ?></div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Trailer Tab -->
    <?php if ($trailer_key): ?>
        <div id="trailerTab" class="tab-content">
            <div style="max-width: 900px; margin: 0 auto;">
                <div class="trailer-wrapper">
                    <!-- YouTube video lazy loading -->
                    <iframe src="" data-src="https://www.youtube.com/embed/<?= $trailer_key ?>?rel=0" allowfullscreen allow="autoplay; encrypted-media"></iframe>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <!-- Recommendations Tab -->
    <?php if (!empty($recs)): ?>
        <div id="recsTab" class="tab-content">
            <div class="movie-grid">
                <?php 
                $recs_slice = array_slice($recs, 0, 6);
                foreach ($recs_slice as $item) {
                    include __DIR__ . '/../includes/movie-card.php';
                }
                ?>
            </div>
        </div>
    <?php endif; ?>
</div>

<script>
function switchTab(tabId, btn) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show current tab content & button line
    const targetTab = document.getElementById(tabId);
    targetTab.classList.add('active');
    btn.classList.add('active');
    
    // Lazy load iframe if it's the trailer tab
    if (tabId === 'trailerTab') {
        const iframe = targetTab.querySelector('iframe');
        if (iframe && !iframe.src) {
            iframe.src = iframe.getAttribute('data-src');
        }
    }
}
</script>
<script src="<?= $base_path ?>/assets/js/watchlist.js"></script>
<?php include __DIR__ . '/../includes/footer.php'; ?>

