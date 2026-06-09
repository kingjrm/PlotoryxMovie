<?php
require_once __DIR__ . '/../config/tmdb.php';

$id = $_GET['id'] ?? null;
$type = $_GET['type'] ?? 'movie';
$season = $_GET['season'] ?? 1;
$episode = $_GET['episode'] ?? 1;

if (!$id) {
    header("Location: {$config['BASE_URL']}/");
    exit;
}

$details = fetchFromTMDB("/$type/$id");
if (!$details) {
    echo "Item not found.";
    exit;
}

include __DIR__ . '/../includes/header.php';

$title = $details['title'] ?? $details['name'] ?? 'Unknown';
$backdrop_path = isset($details['backdrop_path']) ? $config['TMDB_IMAGE_BASE_URL'] . 'original' . $details['backdrop_path'] : '';
$poster_path = isset($details['poster_path']) ? $config['TMDB_IMAGE_BASE_URL'] . 'w342' . $details['poster_path'] : '';

// Process seasons if TV show
$seasons = [];
if ($type === 'tv' && isset($details['seasons'])) {
    foreach ($details['seasons'] as $s) {
        if ($s['season_number'] > 0) {
            $seasons[] = [
                'season_number' => $s['season_number'],
                'episode_count' => $s['episode_count'],
                'name' => $s['name']
            ];
        }
    }
}
?>

<style>
.watch-container {
    padding-top: calc(var(--header-height) + 20px);
    min-height: 100vh;
    background: #06070c;
    transition: all var(--transition-medium);
}

.watch-grid {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 28px;
    margin-bottom: 50px;
    transition: all var(--transition-medium);
}

.player-container {
    grid-column: 1;
    grid-row: 1;
    min-width: 0;
    transition: all var(--transition-medium);
}

.player-wrapper {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
    height: 0;
    overflow: hidden;
    background: #000;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    border: 1px solid var(--border-color);
}

.player-wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
}

/* Player navigation buttons bar */
.player-navigation-bar {
    margin-top: 18px;
    display: none;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    background: #0c0d16;
    padding: 12px 20px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
}

.nav-episode-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 10px 22px;
    border-radius: 30px;
    font-size: 0.85rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.nav-episode-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--border-color-hover);
    transform: translateY(-1px);
}

.nav-episode-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
}

.watch-left {
    grid-column: 1;
    grid-row: 2;
    min-width: 0;
}

.watch-right {
    grid-column: 2;
    grid-row: 1 / span 2;
}

/* Sidebar panel */
.sidebar-panel {
    background: #0c0d16;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    position: sticky;
    top: calc(var(--header-height) + 20px);
}

.sidebar-section {
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding-bottom: 24px;
}

.sidebar-section:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.sidebar-title {
    font-family: var(--font-family-title);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.sidebar-title ion-icon {
    color: #f5c518;
    font-size: 1.1rem;
}

.server-list::-webkit-scrollbar {
    width: 4px;
}
.server-list::-webkit-scrollbar-track {
    background: transparent;
}
.server-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
}

.server-btn {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 600;
    text-align: left;
    transition: all var(--transition-fast);
    cursor: pointer;
    width: 100%;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: break-word;
}

.server-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
}

.server-btn.active {
    background: var(--accent-gradient);
    border-color: transparent;
    color: white;
    box-shadow: 0 4px 12px var(--accent-glow);
}

.server-panel {
    background: #0c0d16;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 20px;
    margin-top: 18px;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
}

.server-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
}

.server-panel-header h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
}

.server-panel-header h4 ion-icon {
    color: #f5c518;
    font-size: 1.15rem;
}

.server-panel-header span {
    font-size: 0.78rem;
    color: var(--text-secondary);
    word-break: break-word;
    overflow-wrap: break-word;
}

.server-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 10px;
    width: 100%;
    min-width: 0;
}

/* Season Select Dropdown styling */
.season-select-wrapper select {
    background: #161827;
    border: 1px solid var(--border-color);
    color: white;
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 0.88rem;
    font-weight: 600;
    outline: none;
    cursor: pointer;
    width: 100%;
    max-width: 100%;
    margin-bottom: 15px;
    transition: border var(--transition-fast);
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.season-select-wrapper select:focus {
    border-color: #f5c518;
}

/* Episode container box from Screenshot */
.episode-box {
    background: #0c0d16;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-width: 100%;
}

.episode-box-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid var(--border-color);
}

.episode-list {
    max-height: 480px;
    overflow-y: auto;
    overflow-x: hidden;
}

.episode-list::-webkit-scrollbar {
    width: 6px;
}
.episode-list::-webkit-scrollbar-track {
    background: transparent;
}
.episode-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
}

.episode-row {
    display: flex;
    gap: 16px;
    padding: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    transition: all var(--transition-fast);
    cursor: pointer;
    text-align: left;
    align-items: center;
}

.episode-row:last-child {
    border-bottom: none;
}

.episode-row:hover {
    background: rgba(255, 255, 255, 0.03);
}

.episode-row.active {
    background: rgba(229, 9, 20, 0.06);
    border-left: 3px solid var(--accent);
    padding-left: 13px; /* compensate border */
}

.episode-thumb-container {
    position: relative;
    flex: 0 0 120px;
    width: 120px;
    aspect-ratio: 16 / 9;
    border-radius: 6px;
    overflow: hidden;
    background: #161827;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.episode-thumb-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-fast);
}

.episode-row:hover .episode-thumb-container img {
    transform: scale(1.05);
}

.episode-play-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity var(--transition-fast);
}

.episode-row:hover .episode-play-overlay {
    opacity: 1;
}

.episode-play-overlay ion-icon {
    font-size: 1.6rem;
    color: white;
    transform: scale(0.8);
    transition: transform var(--transition-fast);
}

.episode-row:hover .episode-play-overlay ion-icon {
    transform: scale(1);
}

.episode-row.active .episode-play-overlay {
    opacity: 1;
    background: rgba(0, 0, 0, 0.45);
}

.episode-row.active .episode-play-overlay ion-icon {
    color: var(--accent);
    transform: scale(1);
}

.episode-row-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.episode-row-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    min-width: 0;
    width: 100%;
}

.episode-row-number-title {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    flex: 1;
}

.episode-row.active .episode-row-number-title {
    color: var(--accent);
}

.episode-row-duration {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 600;
    flex-shrink: 0;
}



.action-control-btn {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    transition: all var(--transition-fast);
    cursor: pointer;
    width: 100%;
}

.action-control-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
    border-color: var(--border-color-hover);
}

.action-control-btn.active {
    border-color: var(--accent);
    color: var(--text-primary);
}

/* Theater Mode Layout styling */
.watch-grid.theater-active {
    grid-template-columns: 1fr 360px;
}

.watch-grid.theater-active .player-container {
    grid-column: 1 / -1;
    grid-row: 1;
}

.watch-grid.theater-active .watch-left {
    grid-column: 1;
    grid-row: 2;
}

.watch-grid.theater-active .watch-right {
    grid-column: 2;
    grid-row: 2;
}

/* Lights off Overlay */
.lights-off-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.98);
    z-index: 998;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition-medium);
}

body.lights-off-active .lights-off-overlay {
    opacity: 1;
    pointer-events: all;
}

body.lights-off-active .player-container {
    position: relative;
    z-index: 999;
    box-shadow: 0 0 100px rgba(0,0,0,0.8);
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.spin {
    animation: spin 1s linear infinite;
    display: inline-block;
}

/* Fix mobile responsiveness and prevent items from looking too massive */
@media (max-width: 992px) {
    .watch-grid, .watch-grid.theater-active {
        grid-template-columns: minmax(0, 1fr) !important;
    }
    .player-container {
        grid-column: 1 !important;
        grid-row: 1 !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        overflow: hidden !important;
    }
    .watch-left {
        grid-column: 1 !important;
        grid-row: 2 !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
    }
    .watch-right {
        grid-column: 1 !important;
        grid-row: 3 !important;
        margin-top: 10px;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
    }
    .sidebar-panel {
        position: static !important;
        width: 100% !important;
        max-width: 100% !important;
    }
}

@media (max-width: 768px) {
    .watch-container {
        padding-top: calc(var(--header-height) + 10px) !important;
        overflow-x: hidden !important;
        max-width: 100% !important;
    }
    .watch-grid {
        gap: 16px !important;
        margin-bottom: 30px !important;
        grid-template-columns: minmax(0, 1fr) !important;
    }
    #playingTitle {
        font-size: 1.5rem !important;
        line-height: 1.2 !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        word-break: break-word !important;
    }
    #episodeSubtitle {
        font-size: 0.9rem !important;
        margin-bottom: 12px !important;
    }
    .watch-left p {
        font-size: 0.92rem !important;
        line-height: 1.6 !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
    }
    .sidebar-panel {
        padding: 16px !important;
        gap: 18px !important;
    }
    .sidebar-section {
        padding-bottom: 18px !important;
    }
    .player-navigation-bar {
        padding: 10px 12px !important;
        margin-top: 12px !important;
        border-radius: 8px !important;
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
        grid-template-areas: 
            "indicator indicator"
            "prev next" !important;
        gap: 10px !important;
        justify-items: center !important;
        width: 100% !important;
        min-width: 0 !important;
    }
    .nav-episode-btn {
        padding: 8px 16px !important;
        font-size: 0.78rem !important;
        width: 100% !important;
        justify-content: center !important;
    }
    #prevEpisodeBtn {
        grid-area: prev !important;
    }
    #nextEpisodeBtn {
        grid-area: next !important;
    }
    #playerNavIndicator {
        font-size: 0.78rem !important;
        grid-area: indicator !important;
        margin-bottom: 2px !important;
        text-align: center !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
        max-width: 100% !important;
    }
    .server-panel {
        padding: 12px !important;
    }
    .server-panel-header {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 4px !important;
    }
    .server-panel-header span {
        font-size: 0.74rem !important;
        line-height: 1.4 !important;
    }
    .server-grid {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
        gap: 8px !important;
    }
    .server-btn {
        padding: 8px 10px !important;
        font-size: 0.76rem !important;
        text-align: center !important;
        white-space: normal !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
    }
    .episode-box-header {
        padding: 10px 14px !important;
    }
    .episode-list {
        max-height: 320px !important;
    }
    .episode-row {
        padding: 10px 12px !important;
        gap: 10px !important;
        max-width: 100% !important;
        overflow: hidden !important;
    }
    .episode-thumb-container {
        flex: 0 0 80px !important;
        width: 80px !important;
    }
    .episode-row-number-title {
        font-size: 0.78rem !important;
    }
    .episode-row-duration {
        font-size: 0.68rem !important;
    }
    .action-control-btn {
        padding: 10px 14px !important;
        font-size: 0.8rem !important;
    }
}

@media (max-width: 480px) {
    .watch-container {
        padding-top: calc(var(--header-height) + 8px) !important;
    }
    .watch-grid {
        gap: 12px !important;
        margin-bottom: 24px !important;
    }
    .player-wrapper {
        border-radius: 8px !important;
    }
    #playingTitle {
        font-size: 1.35rem !important;
    }
    #episodeSubtitle {
        font-size: 0.85rem !important;
        margin-bottom: 8px !important;
    }
    .watch-left p {
        font-size: 0.88rem !important;
        line-height: 1.5 !important;
    }
    .sidebar-panel {
        padding: 12px !important;
        gap: 14px !important;
        border-radius: 12px !important;
    }
    .sidebar-title {
        font-size: 0.85rem !important;
        margin-bottom: 10px !important;
    }
    .season-select-wrapper select {
        padding: 8px 12px !important;
        font-size: 0.82rem !important;
        margin-bottom: 10px !important;
        border-radius: 8px !important;
    }
    .episode-box {
        border-radius: 12px !important;
    }
    .episode-box-header {
        padding: 8px 12px !important;
    }
    .episode-list {
        max-height: 280px !important;
    }
    .episode-row {
        padding: 8px 10px !important;
        gap: 8px !important;
    }
    .episode-thumb-container {
        flex: 0 0 70px !important;
        width: 70px !important;
    }
    .episode-row-number-title {
        font-size: 0.75rem !important;
    }
    .episode-row-duration {
        font-size: 0.65rem !important;
    }
    .server-panel {
        padding: 10px !important;
        border-radius: 12px !important;
    }
    .server-panel-header h4 {
        font-size: 0.9rem !important;
    }
    .server-panel-header span {
        font-size: 0.7rem !important;
    }
    .server-btn {
        padding: 6px 8px !important;
        font-size: 0.72rem !important;
        border-radius: 6px !important;
    }
    .player-navigation-bar {
        padding: 8px 10px !important;
        gap: 8px !important;
        border-radius: 6px !important;
    }
    .nav-episode-btn {
        padding: 6px 12px !important;
        font-size: 0.74rem !important;
        border-radius: 20px !important;
    }
    .action-control-btn {
        padding: 8px 12px !important;
        font-size: 0.76rem !important;
        border-radius: 8px !important;
    }
}

/* Fullscreen player scaling overrides */
.player-wrapper:fullscreen {
    width: 100vw !important;
    height: 100vh !important;
    padding-bottom: 0 !important;
    border-radius: 0 !important;
    border: none !important;
}
.player-wrapper:-webkit-full-screen {
    width: 100vw !important;
    height: 100vh !important;
    padding-bottom: 0 !important;
    border-radius: 0 !important;
    border: none !important;
}
.player-wrapper:-moz-full-screen {
    width: 100vw !important;
    height: 100vh !important;
    padding-bottom: 0 !important;
    border-radius: 0 !important;
    border: none !important;
}
.player-wrapper:-ms-fullscreen {
    width: 100vw !important;
    height: 100vh !important;
    padding-bottom: 0 !important;
    border-radius: 0 !important;
    border: none !important;
}
</style>

<!-- Lights off overlay element -->
<div class="lights-off-overlay" id="lightsOffOverlay"></div>

<div class="watch-container">
    <div class="container">
        <div class="watch-grid" id="watchGrid">
            
            <!-- Video Player block -->
            <div class="player-container" id="playerContainer">
                <div class="player-wrapper">
                    <!-- Fully updated standard fullscreen triggers for modern browsers -->
                    <iframe id="videoPlayer" src="" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen allow="autoplay; fullscreen *; picture-in-picture"></iframe>
                </div>
                
                <!-- Player navigation buttons (Bottom of the movie screen) -->
                <div class="player-navigation-bar" id="playerNavBar">
                    <button class="nav-episode-btn" id="prevEpisodeBtn" onclick="playPrevious()">
                        <ion-icon name="play-back-outline"></ion-icon> Previous
                    </button>
                    <span id="playerNavIndicator"></span>
                    <button class="nav-episode-btn" id="nextEpisodeBtn" onclick="playNext()">
                        Next <ion-icon name="play-forward-outline"></ion-icon>
                    </button>
                </div>

                <!-- Servers Selector panel - Moved below player to avoid scrolling on the side -->
                <div class="server-panel">
                    <div class="server-panel-header">
                        <h4>
                            <ion-icon name="server-outline"></ion-icon> Stream Servers
                        </h4>
                        <span>If the video doesn't load, switch to another server</span>
                    </div>
                    <div class="server-grid">
                        <button class="server-btn active" onclick="setServer(1)">Server 1 (VidSrc.to / Mirror)</button>
                        <button class="server-btn" onclick="setServer(2)">Server 2 (VidSrc.me / Mirror)</button>
                        <button class="server-btn" onclick="setServer(3)">Server 3 (VidSrc.cc)</button>
                        <button class="server-btn" onclick="setServer(4)">Server 4 (VidLink.pro)</button>
                        <button class="server-btn" onclick="setServer(5)">Server 5 (Embed.su)</button>
                        <button class="server-btn" onclick="setServer(6)">Server 6 (AutoEmbed.cc)</button>
                        <button class="server-btn" onclick="setServer(7)">Server 7 (MoviesAPI.club)</button>
                        <button class="server-btn" onclick="setServer(8)">Server 8 (SuperEmbed)</button>
                    </div>
                </div>
            </div>

            <!-- Left Info column -->
            <div class="watch-left">
                <h1 id="playingTitle" style="font-size: 2.2rem; font-weight:800; margin-bottom:10px; font-family:var(--font-family-title);"><?= htmlspecialchars($title) ?></h1>
                <?php if ($type === 'tv'): ?>
                    <h3 id="episodeSubtitle" style="color: var(--accent); margin-bottom: 15px; font-weight:600; font-family:var(--font-family-title);">Season 1, Episode 1</h3>
                <?php endif; ?>
                <p style="color: var(--text-secondary); line-height:1.7; font-size:1.02rem;"><?= htmlspecialchars($details['overview']) ?></p>
                
                <div style="margin-top: 35px;">
                    <a href="<?= $base_path ?>/details?id=<?= htmlspecialchars($id) ?>&type=<?= htmlspecialchars($type) ?>" class="btn btn-secondary">
                        <ion-icon name="arrow-back" style="font-size:1.1rem;"></ion-icon> Back to Details
                    </a>
                </div>
            </div>

            <!-- Right Sidebar column -->
            <div class="watch-right">
                <div class="sidebar-panel">
                    
                    <!-- TV Season/Episode Selector panel (Matches the screenshot layout with dropdown!) -->
                    <?php if ($type === 'tv' && !empty($seasons)): ?>
                        <div class="sidebar-section">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                <h4 class="sidebar-title" style="margin-bottom:0; font-size: 0.9rem;"><ion-icon name="list-outline"></ion-icon> Seasons</h4>
                            </div>
                            
                            <!-- Dropdown select menu for seasons -->
                            <div class="season-select-wrapper">
                                <select id="seasonSelect" onchange="onSeasonChange()">
                                    <?php foreach ($seasons as $s): ?>
                                        <option value="<?= $s['season_number'] ?>" data-episodes="<?= $s['episode_count'] ?>">
                                            <?= htmlspecialchars($s['name']) ?> (<?= $s['episode_count'] ?> Ep)
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            
                            <!-- Episode list card box -->
                            <div class="episode-box">
                                <div class="episode-box-header">
                                    <div style="display:flex; align-items:center; gap:6px;">
                                        <ion-icon name="tv-outline" style="color: #f5c518; font-size: 1.1rem;"></ion-icon>
                                        <span id="activeSeasonTitle" style="font-weight:700; font-family:var(--font-family-title); font-size: 0.85rem;">Season 1</span>
                                    </div>
                                    <span id="episodeCountBadge" style="color: var(--text-secondary); font-size: 0.75rem; font-weight:600;">0 eps</span>
                                </div>
                                <div class="episode-list" id="episodeList">
                                    <!-- Populated via dynamic AJAX search proxy -->
                                </div>
                            </div>
                        </div>
                    <?php endif; ?>


                    <!-- Control Settings panel -->
                    <div class="sidebar-section">
                        <h4 class="sidebar-title"><ion-icon name="options-outline"></ion-icon> Settings</h4>
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <button class="action-control-btn" id="theaterBtn">
                                <ion-icon name="tv-outline" style="font-size:1.1rem;"></ion-icon> Theater Mode
                            </button>
                            <button class="action-control-btn" id="lightsBtn">
                                <ion-icon name="bulb-outline" style="font-size:1.1rem;"></ion-icon> Lights Off
                            </button>
                            <button class="action-control-btn" id="fullscreenBtn">
                                <ion-icon name="expand-outline" style="font-size:1.1rem;"></ion-icon> Fullscreen
                            </button>
                        </div>
                    </div>

                </div>
            </div>
            
        </div>
    </div>
</div>

<script>
const tmdbId = <?= json_encode($id) ?>;
const mediaType = <?= json_encode($type) ?>;
let currentSeason = parseInt(<?= json_encode($season) ?>) || 1;
let currentEpisode = parseInt(<?= json_encode($episode) ?>) || 1;
let currentServer = 1;
const basePath = window.basePath || '';

// Seasons metadata
const seasonsData = <?= json_encode($seasons) ?>;

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

// Server embed formats
function getEmbedUrl(server, id, type, season, episode) {
    switch(server) {
        case 1: // VidSrc.to (Using active vsrc.su mirror)
            return type === 'movie' 
                ? `https://vsrc.su/embed/movie/${id}` 
                : `https://vsrc.su/embed/tv/${id}/${season}/${episode}`;
        case 2: // VidSrc.me (Using active vidsrcme.ru mirror)
            return type === 'movie'
                ? `https://vidsrcme.ru/embed/movie?tmdb=${id}`
                : `https://vidsrcme.ru/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
        case 3: // VidSrc.cc
            return type === 'movie'
                ? `https://vidsrc.cc/v2/embed/movie/${id}`
                : `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
        case 4: // VidLink.pro (Corrected path structure with crimson theme matching)
            return type === 'movie'
                ? `https://vidlink.pro/movie/${id}?primaryColor=e50914`
                : `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=e50914`;
        case 5: // Embed.su
            return type === 'movie'
                ? `https://embed.su/embed/movie/${id}`
                : `https://embed.su/embed/tv/${id}/${season}/${episode}`;
        case 6: // AutoEmbed (Updated autoembed.co -> autoembed.cc with correct endpoints)
            return type === 'movie'
                ? `https://autoembed.cc/embed/movie/${id}`
                : `https://autoembed.cc/embed/tv/${id}?s=${season}&e=${episode}`;
        case 7: // MoviesAPI.club
            return type === 'movie'
                ? `https://moviesapi.club/movie/${id}`
                : `https://moviesapi.club/tv/${id}/${season}/${episode}`;
        case 8: // SuperEmbed / MultiEmbed
            return type === 'movie'
                ? `https://multiembed.to/embed.php?type=movie&tmdb=${id}`
                : `https://multiembed.to/embed.php?type=tv&tmdb=${id}&s=${season}&e=${episode}`;
        default:
            return `https://vsrc.su/embed/movie/${id}`;
    }
}

// Update player iframe src and save state to localStorage
function updatePlayer() {
    const player = document.getElementById('videoPlayer');
    const newSrc = getEmbedUrl(currentServer, tmdbId, mediaType, currentSeason, currentEpisode);
    player.src = newSrc;
    
    // Save state to "Continue Watching"
    saveContinueWatching();
    
    // Update player prev/next controls and metadata
    updateNavigationControls();
}

// Set active streaming server
function setServer(srv) {
    currentServer = srv;
    
    // Manage active states on buttons
    document.querySelectorAll('.server-btn').forEach((btn, index) => {
        if (index + 1 === srv) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    updatePlayer();
}

// Fetch TV season data dynamically via backend proxy
async function loadSeasonEpisodes(seasonNum) {
    const listContainer = document.getElementById('episodeList');
    const activeTitle = document.getElementById('activeSeasonTitle');
    const badge = document.getElementById('episodeCountBadge');
    
    if (!listContainer) return;
    
    // Show spinner
    listContainer.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; padding: 40px; color:var(--text-secondary);">
            <div style="text-align:center;">
                <ion-icon name="sync-outline" class="spin" style="font-size:2rem; margin-bottom:10px; color: #f5c518;"></ion-icon>
                <div style="font-size:0.85rem; font-weight:600;">Loading episodes...</div>
            </div>
        </div>
    `;
    
    try {
        const response = await fetch(`${window.location.origin}${basePath}/api/season.php?id=${tmdbId}&season=${seasonNum}`);
        const data = await response.json();
        
        if (data.episodes && data.episodes.length > 0) {
            renderEpisodeRows(data.episodes);
            if (badge) badge.textContent = `${data.episodes.length} eps`;
        } else {
            listContainer.innerHTML = '<p style="padding:20px; text-align:center; color:var(--text-secondary); font-size:0.85rem;">No episodes found.</p>';
            if (badge) badge.textContent = `0 eps`;
        }
    } catch (error) {
        console.error('Error fetching season details', error);
        listContainer.innerHTML = '<p style="padding:20px; text-align:center; color:var(--text-secondary); font-size:0.85rem;">Error loading episodes.</p>';
    }
    
    if (activeTitle) {
        activeTitle.textContent = `Season ${seasonNum}`;
    }
}

// Render dynamic episode rows with thumbnails, titles, and runtimes (Matches the screenshot layout!)
function renderEpisodeRows(episodes) {
    const listContainer = document.getElementById('episodeList');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    
    episodes.forEach(ep => {
        const epNum = parseInt(ep.episode_number);
        const epName = escapeHTML(ep.name || `Episode ${epNum}`);
        const duration = escapeHTML(ep.runtime ? `${ep.runtime}m` : '45m');
        const stillPath = ep.still_path 
            ? `https://image.tmdb.org/t/p/w185${ep.still_path}`
            : '';
            
        const row = document.createElement('div');
        row.className = `episode-row ${epNum === currentEpisode ? 'active' : ''}`;
        row.setAttribute('data-episode', epNum);
        row.onclick = () => {
            currentEpisode = epNum;
            updatePlayer();
        };
        
        let thumbHtml = '';
        if (stillPath) {
            thumbHtml = `<img src="${stillPath}" alt="${epName}" loading="lazy">`;
        } else {
            thumbHtml = `
                <div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; background:#161827;">
                    <ion-icon name="play" style="font-size:1.5rem; color:rgba(255,255,255,0.05);"></ion-icon>
                </div>
            `;
        }
        
        row.innerHTML = `
            <div class="episode-thumb-container">
                ${thumbHtml}
                <div class="episode-play-overlay">
                    <ion-icon name="play-sharp"></ion-icon>
                </div>
            </div>
            <div class="episode-row-info">
                <div class="episode-row-title-row">
                    <span class="episode-row-number-title">${epNum}. ${epName}</span>
                    <span class="episode-row-duration">${duration}</span>
                </div>
            </div>
        `;
        
        listContainer.appendChild(row);
    });
    
    // Auto-scroll the active episode row into view within the scrollbox
    setTimeout(() => {
        const activeRow = listContainer.querySelector('.episode-row.active');
        if (activeRow) {
            activeRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 100);
}

function onSeasonChange() {
    const select = document.getElementById('seasonSelect');
    if (!select) return;
    
    currentSeason = parseInt(select.value);
    currentEpisode = 1; // reset episode to 1 on season switch
    loadSeasonEpisodes(currentSeason);
    updatePlayer();
}

// Previous & Next navigation handlers
function updateNavigationControls() {
    if (mediaType === 'movie') {
        document.getElementById('playerNavBar').style.display = 'none';
        return;
    }
    
    document.getElementById('playerNavBar').style.display = 'flex';
    
    const prevBtn = document.getElementById('prevEpisodeBtn');
    const nextBtn = document.getElementById('nextEpisodeBtn');
    const indicator = document.getElementById('playerNavIndicator');
    
    // Find current season max episodes
    const currentSeasonObj = seasonsData.find(s => s.season_number === currentSeason);
    const maxEpisodes = currentSeasonObj ? currentSeasonObj.episode_count : 1;
    
    indicator.textContent = `Season ${currentSeason}, Episode ${currentEpisode}`;
    
    // Prev state logic
    if (currentEpisode === 1 && currentSeason === 1) {
        prevBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
    }
    
    // Next state logic
    const nextSeasonExists = seasonsData.some(s => s.season_number === currentSeason + 1);
    if (currentEpisode === maxEpisodes && !nextSeasonExists) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
    
    // Update active highlight classes in episode rows
    document.querySelectorAll('.episode-row').forEach(row => {
        if (parseInt(row.getAttribute('data-episode')) === currentEpisode) {
            row.classList.add('active');
        } else {
            row.classList.remove('active');
        }
    });
    
    const sub = document.getElementById('episodeSubtitle');
    if (sub) {
        sub.textContent = `Season ${currentSeason}, Episode ${currentEpisode}`;
    }
}

function playPrevious() {
    if (currentEpisode > 1) {
        currentEpisode--;
        updatePlayer();
    } else if (currentSeason > 1) {
        // Go to last episode of previous season
        currentSeason--;
        const prevSeasonObj = seasonsData.find(s => s.season_number === currentSeason);
        currentEpisode = prevSeasonObj ? prevSeasonObj.episode_count : 1;
        
        // Update season dropdown selector
        const select = document.getElementById('seasonSelect');
        if (select) select.value = currentSeason;
        
        loadSeasonEpisodes(currentSeason);
        updatePlayer();
    }
}

function playNext() {
    const currentSeasonObj = seasonsData.find(s => s.season_number === currentSeason);
    const maxEpisodes = currentSeasonObj ? currentSeasonObj.episode_count : 1;
    
    if (currentEpisode < maxEpisodes) {
        currentEpisode++;
        updatePlayer();
    } else {
        const nextSeasonExists = seasonsData.some(s => s.season_number === currentSeason + 1);
        if (nextSeasonExists) {
            currentSeason++;
            currentEpisode = 1;
            
            // Update season dropdown selector
            const select = document.getElementById('seasonSelect');
            if (select) select.value = currentSeason;
            
            loadSeasonEpisodes(currentSeason);
            updatePlayer();
        }
    }
}

function saveContinueWatching() {
    const continueItem = {
        id: tmdbId,
        type: mediaType,
        title: "<?= htmlspecialchars($title) ?>",
        poster: "<?= $poster_path ?>",
        backdrop: "<?= $backdrop_path ?>",
        season: mediaType === 'tv' ? currentSeason : null,
        episode: mediaType === 'tv' ? currentEpisode : null,
        timestamp: Date.now()
    };
    
    let list = JSON.parse(localStorage.getItem('continueWatching')) || [];
    // Remove existing item of same ID and type
    list = list.filter(item => !(item.id === tmdbId && item.type === mediaType));
    // Prepend to top
    list.unshift(continueItem);
    // Limit to top 12 items
    if (list.length > 12) list.pop();
    localStorage.setItem('continueWatching', JSON.stringify(list));
}

// Event Listeners for controls
document.addEventListener('DOMContentLoaded', () => {
    // Theater Mode Toggle
    const theaterBtn = document.getElementById('theaterBtn');
    const watchGrid = document.getElementById('watchGrid');
    if (theaterBtn && watchGrid) {
        theaterBtn.addEventListener('click', () => {
            watchGrid.classList.toggle('theater-active');
            theaterBtn.classList.toggle('active');
        });
    }
    
    // Lights Off Toggle
    const lightsBtn = document.getElementById('lightsBtn');
    const body = document.body;
    const overlay = document.getElementById('lightsOffOverlay');
    if (lightsBtn && overlay) {
        const toggleLights = () => {
            body.classList.toggle('lights-off-active');
            lightsBtn.classList.toggle('active');
        };
        lightsBtn.addEventListener('click', toggleLights);
        overlay.addEventListener('click', toggleLights);
    }

    // Fullscreen Toggle
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const playerWrapper = document.querySelector('.player-wrapper');
    if (fullscreenBtn && playerWrapper) {
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement && 
                !document.webkitFullscreenElement && 
                !document.mozFullScreenElement && 
                !document.msFullscreenElement) {
                if (playerWrapper.requestFullscreen) {
                    playerWrapper.requestFullscreen();
                } else if (playerWrapper.webkitRequestFullscreen) {
                    playerWrapper.webkitRequestFullscreen();
                } else if (playerWrapper.mozRequestFullScreen) {
                    playerWrapper.mozRequestFullScreen();
                } else if (playerWrapper.msRequestFullscreen) {
                    playerWrapper.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        });

        // Update button text/icon when fullscreen changes natively
        const onFullscreenChange = () => {
            const isFs = document.fullscreenElement || 
                         document.webkitFullscreenElement || 
                         document.mozFullScreenElement || 
                         document.msFullscreenElement;
            if (isFs) {
                fullscreenBtn.innerHTML = '<ion-icon name="contract-outline" style="font-size:1.1rem;"></ion-icon> Exit Fullscreen';
                fullscreenBtn.classList.add('active');
            } else {
                fullscreenBtn.innerHTML = '<ion-icon name="expand-outline" style="font-size:1.1rem;"></ion-icon> Fullscreen';
                fullscreenBtn.classList.remove('active');
            }
        };

        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange);
        document.addEventListener('mozfullscreenchange', onFullscreenChange);
        document.addEventListener('MSFullscreenChange', onFullscreenChange);
    }
    
    // Init states
    if (mediaType === 'tv') {
        const select = document.getElementById('seasonSelect');
        if (select) {
            select.value = currentSeason;
        }
        loadSeasonEpisodes(currentSeason);
    }
    
    updatePlayer();
});
</script>

<?php include __DIR__ . '/../includes/footer.php'; ?>




