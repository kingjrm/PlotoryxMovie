<?php
require_once __DIR__ . '/../config/tmdb.php';
include __DIR__ . '/../includes/header.php';
?>

<div class="container" style="padding-top: calc(var(--header-height) + 40px); min-height: 80vh;">
    <h1 style="margin-bottom: 30px;">Your Watchlist</h1>
    
    <div class="movie-grid" id="watchlistGrid">
        <!-- populated via js -->
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
    const grid = document.getElementById('watchlistGrid');
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    
    if (watchlist.length === 0) {
        grid.innerHTML = '<p>Your watchlist is empty.</p>';
        return;
    }
    
    watchlist.forEach(item => {
        const title = escapeHTML(item.title);
        const poster_path = escapeHTML(item.poster);
        const id = escapeHTML(item.id);
        const type = escapeHTML(item.type);
        const base_path = '<?= $base_path ?>';
        
        grid.innerHTML += `
        <a href="${base_path}/details?id=${id}&type=${type}" class="movie-card">
            <img loading="lazy" src="${poster_path}" alt="${title}">
            <div class="movie-info">
                <div class="movie-title">${title}</div>
            </div>
        </a>
        `;
    });
});
</script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
