document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile navigation drawer toggle
    const burgerMenu = document.getElementById('burgerMenu');
    const navLinks = document.getElementById('navLinks');
    
    if (burgerMenu && navLinks) {
        burgerMenu.addEventListener('click', () => {
            burgerMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                burgerMenu.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!burgerMenu.contains(e.target) && !navLinks.contains(e.target)) {
                burgerMenu.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    // Mobile search overlay toggle
    const mobileSearchTrigger = document.getElementById('mobileSearchTrigger');
    const closeSearchBtn = document.getElementById('closeSearchBtn');
    const searchBar = document.getElementById('searchBar');
    const searchInput = document.getElementById('searchInput');

    if (mobileSearchTrigger && closeSearchBtn && searchBar && searchInput) {
        mobileSearchTrigger.addEventListener('click', () => {
            searchBar.classList.add('active');
            setTimeout(() => {
                searchInput.focus();
            }, 100);
        });

        closeSearchBtn.addEventListener('click', () => {
            searchBar.classList.remove('active');
            searchInput.value = '';
            const liveResults = document.getElementById('liveSearchResults');
            if (liveResults) {
                liveResults.style.display = 'none';
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // 's' to focus search
        if (e.key === 's' && e.target.tagName !== 'INPUT') {
            const input = document.getElementById('searchInput');
            if (input) {
                e.preventDefault();
                input.focus();
            }
        }
    });
});

