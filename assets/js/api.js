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
    const searchInput = document.getElementById('searchInput');
    const liveResults = document.getElementById('liveSearchResults');
    let timeout = null;
    const basePath = window.basePath || '';

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            const query = e.target.value.trim();
            
            if (query.length > 2) {
                timeout = setTimeout(() => {
                    fetchSearch(query);
                }, 400);
            } else {
                liveResults.style.display = 'none';
            }
        });
    }

    async function fetchSearch(query) {
        try {
            const response = await fetch(`${window.location.origin}${basePath}/api/search.php?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                renderLiveResults(data.results.filter(item => item.media_type !== 'person').slice(0, 5));
            } else {
                liveResults.innerHTML = '<p style="padding: 10px; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">No results found</p>';
                liveResults.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching search results', error);
        }
    }

    function renderLiveResults(results) {
        liveResults.innerHTML = '';
        results.forEach(item => {
            const title = escapeHTML(item.title || item.name);
            const type = escapeHTML(item.title ? 'movie' : 'tv');
            const year = escapeHTML((item.release_date || item.first_air_date || '').substring(0, 4) || 'N/A');
            const rating = escapeHTML(item.vote_average ? round(item.vote_average, 1) : 'N/A');
            const safeId = escapeHTML(item.id);
            
            // Poster path
            const posterUrl = item.poster_path 
                ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                : '';
                
            const a = document.createElement('a');
            a.href = `${window.location.origin}${basePath}/details?id=${safeId}&type=${type}`;
            a.className = 'search-item';
            
            let posterHtml = '';
            if (posterUrl) {
                const safePoster = escapeHTML(posterUrl);
                posterHtml = `<img src="${safePoster}" alt="${title}">`;
            } else {
                posterHtml = `
                    <div style="width:40px; height:56px; display:flex; justify-content:center; align-items:center; background:#161827; border-radius:4px;">
                        <ion-icon name="image-outline" style="font-size:1.2rem; color:rgba(255,255,255,0.1);"></ion-icon>
                    </div>
                `;
            }
            
            a.innerHTML = `
                ${posterHtml}
                <div class="search-item-info">
                    <div class="search-item-title">${title}</div>
                    <div class="search-item-meta">
                        <span class="search-item-badge">${type === 'movie' ? 'Movie' : 'Series'}</span>
                        <span>⭐ ${rating}</span>
                        <span>${year}</span>
                    </div>
                </div>
            `;
            
            liveResults.appendChild(a);
        });
        liveResults.style.display = 'block';
    }
    
    function round(value, precision) {
        const multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-bar')) {
            liveResults.style.display = 'none';
        }
    });
});
