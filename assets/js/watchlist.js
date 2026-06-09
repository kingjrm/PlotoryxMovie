document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('addWatchlist');
    
    if (btn) {
        const id = btn.dataset.id;
        const type = btn.dataset.type;
        let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        
        const exists = watchlist.find(item => item.id === id && item.type === type);
        if (exists) {
            btn.innerHTML = '<ion-icon name="checkmark"></ion-icon> <span>In Watchlist</span>';
            btn.classList.add('btn-primary');
            btn.classList.remove('btn-secondary');
        }

        btn.addEventListener('click', () => {
            watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
            const index = watchlist.findIndex(item => item.id === id && item.type === type);
            
            if (index > -1) {
                // Remove
                watchlist.splice(index, 1);
                localStorage.setItem('watchlist', JSON.stringify(watchlist));
                btn.innerHTML = '<ion-icon name="add"></ion-icon> <span>Add to Watchlist</span>';
                btn.classList.add('btn-secondary');
                btn.classList.remove('btn-primary');
                showToast('Removed from Watchlist');
            } else {
                // Add
                watchlist.push({
                    id, type,
                    title: btn.dataset.title,
                    poster: btn.dataset.poster
                });
                localStorage.setItem('watchlist', JSON.stringify(watchlist));
                btn.innerHTML = '<ion-icon name="checkmark"></ion-icon> <span>In Watchlist</span>';
                btn.classList.add('btn-primary');
                btn.classList.remove('btn-secondary');
                showToast('Added to Watchlist');
            }
        });
    }
    
    function showToast(message) {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.cssText = `
                position: fixed;
                bottom: 25px;
                right: 25px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 9999;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            background: rgba(12, 13, 22, 0.95);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            font-size: 0.9rem;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: auto;
        `;
        
        const icon = document.createElement('ion-icon');
        icon.name = 'bookmark';
        icon.style.color = '#e50914';
        icon.style.fontSize = '1.2rem';
        
        const text = document.createElement('span');
        text.textContent = message;
        
        toast.appendChild(icon);
        toast.appendChild(text);
        container.appendChild(toast);
        
        // Trigger reflow
        toast.offsetHeight;
        
        // Animate in
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
        
        // Animate out
        setTimeout(() => {
            toast.style.transform = 'translateY(-20px)';
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 350);
        }, 2800);
    }
});

