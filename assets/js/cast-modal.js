/**
 * PlotoryxMovie - Premium Interactive Cast Details & Movies Showcase Modal
 * Renders glassmorphic modal overlays when clicking actor/cast cards.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject custom styles dynamically to keep page lightweight and code modular
    const styleId = 'cast-modal-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Modal Overlay */
            .cast-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(4, 5, 10, 0.75);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                padding: 20px;
            }
            .cast-modal-overlay.active {
                opacity: 1;
                pointer-events: auto;
            }

            /* Modal Container */
            .cast-modal-container {
                background: rgba(12, 13, 22, 0.97);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 20px;
                width: 100%;
                max-width: 950px;
                max-height: 85vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                position: relative;
                box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.8), 0 0 50px rgba(245, 197, 24, 0.05);
                transform: scale(0.92) translateY(20px);
                transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .cast-modal-overlay.active .cast-modal-container {
                transform: scale(1) translateY(0);
            }

            /* Close Button */
            .cast-modal-close {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: var(--text-primary);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 1.5rem;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 10;
                outline: none;
            }
            .cast-modal-close:hover {
                background: var(--accent);
                border-color: var(--accent);
                transform: rotate(90deg) scale(1.05);
                box-shadow: 0 0 15px var(--accent-glow);
            }

            /* Main Layout */
            .cast-modal-content {
                display: grid;
                grid-template-columns: 320px 1fr;
                height: 100%;
                max-height: 85vh;
                overflow: hidden;
            }

            @media (max-width: 768px) {
                .cast-modal-content {
                    grid-template-columns: 1fr;
                    overflow-y: auto;
                }
                .cast-modal-container {
                    max-height: 90vh;
                }
            }

            /* Bio/Profile Panel */
            .cast-modal-bio-panel {
                padding: 35px 25px;
                background: rgba(255, 255, 255, 0.01);
                border-right: 1px solid rgba(255, 255, 255, 0.05);
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                overflow-y: auto;
                max-height: 85vh;
            }

            @media (max-width: 768px) {
                .cast-modal-bio-panel {
                    max-height: none;
                    border-right: none;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 45px 20px 25px;
                }
            }

            .cast-modal-avatar-wrapper {
                width: 150px;
                height: 150px;
                border-radius: 50%;
                overflow: hidden;
                margin-bottom: 20px;
                border: 3px solid #f5c518; /* Golden Accent */
                box-shadow: 0 8px 24px rgba(245, 197, 24, 0.2);
                flex-shrink: 0;
            }

            .cast-modal-avatar {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .cast-modal-name {
                font-family: var(--font-family-title);
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--text-primary);
                margin-bottom: 12px;
                line-height: 1.2;
            }

            .cast-modal-meta {
                width: 100%;
                margin-bottom: 18px;
                font-size: 0.85rem;
                text-align: left;
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 14px;
            }

            .cast-modal-meta p {
                margin-bottom: 8px;
                color: var(--text-secondary);
                line-height: 1.4;
            }
            .cast-modal-meta p:last-child {
                margin-bottom: 0;
            }

            .cast-modal-meta strong {
                color: var(--text-primary);
            }

            .cast-modal-bio-scroll {
                text-align: left;
                font-size: 0.88rem;
                line-height: 1.6;
                color: var(--text-secondary);
                overflow-y: auto;
                padding-right: 8px;
                width: 100%;
                max-height: 250px;
            }

            /* Custom Slim Scrollbars */
            .cast-modal-bio-scroll::-webkit-scrollbar,
            .cast-modal-slider::-webkit-scrollbar {
                width: 4px;
                height: 4px;
            }
            .cast-modal-bio-scroll::-webkit-scrollbar-track,
            .cast-modal-slider::-webkit-scrollbar-track {
                background: transparent;
            }
            .cast-modal-bio-scroll::-webkit-scrollbar-thumb,
            .cast-modal-slider::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
            }
            .cast-modal-bio-scroll::-webkit-scrollbar-thumb:hover,
            .cast-modal-slider::-webkit-scrollbar-thumb:hover {
                background: #f5c518;
            }

            /* Filmography Panel */
            .cast-modal-filmography-panel {
                padding: 40px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                overflow: hidden;
                max-height: 85vh;
            }

            @media (max-width: 768px) {
                .cast-modal-filmography-panel {
                    padding: 25px 20px;
                    max-height: none;
                }
            }

            .cast-modal-section-title {
                font-family: var(--font-family-title);
                font-size: 1.25rem;
                font-weight: 700;
                margin-bottom: 20px;
                color: var(--text-primary);
                border-left: 4px solid #f5c518;
                padding-left: 12px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .cast-modal-slider-wrapper {
                position: relative;
                display: flex;
                align-items: center;
                width: 100%;
            }

            .cast-modal-slider {
                display: flex;
                gap: 16px;
                overflow-x: auto;
                scroll-behavior: smooth;
                padding: 10px 4px 20px;
                width: 100%;
            }

            /* Credits Cards */
            .cast-movie-card {
                flex: 0 0 130px;
                display: flex;
                flex-direction: column;
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                cursor: pointer;
            }

            .cast-movie-card:hover {
                transform: translateY(-8px);
                border-color: #f5c518;
                box-shadow: 0 12px 24px rgba(245, 197, 24, 0.15);
                background: rgba(255, 255, 255, 0.05);
            }

            .cast-movie-poster-wrapper {
                aspect-ratio: 2 / 3;
                overflow: hidden;
                position: relative;
                background: #121526;
            }

            .cast-movie-poster {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.35s ease;
            }

            .cast-movie-card:hover .cast-movie-poster {
                transform: scale(1.05);
            }

            .cast-movie-rating-badge {
                position: absolute;
                top: 6px;
                right: 6px;
                background: rgba(6, 7, 13, 0.85);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                padding: 2px 5px;
                font-size: 0.7rem;
                font-weight: 700;
                color: #f5c518;
                display: flex;
                align-items: center;
                gap: 2px;
                backdrop-filter: blur(4px);
                z-index: 2;
            }

            .cast-movie-info {
                padding: 10px;
                display: flex;
                flex-direction: column;
                flex-grow: 1;
                min-height: 70px;
            }

            .cast-movie-title {
                font-size: 0.8rem;
                font-weight: 600;
                color: var(--text-primary);
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                line-clamp: 2;
                -webkit-box-orient: vertical;
                line-height: 1.2;
                margin-bottom: 4px;
            }

            .cast-movie-character {
                font-size: 0.7rem;
                color: var(--text-secondary);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin-top: auto;
            }

            /* Slider navigation buttons */
            .cast-slider-btn {
                position: absolute;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: rgba(12, 13, 22, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                outline: none;
            }

            .cast-slider-btn:hover {
                background: #f5c518;
                color: #0c0d16;
                border-color: #f5c518;
                transform: scale(1.1);
            }

            .cast-slider-btn.prev-btn {
                left: -18px;
            }

            .cast-slider-btn.next-btn {
                right: -18px;
            }

            /* Loader Styling */
            .cast-modal-loader {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 380px;
                color: var(--text-secondary);
                font-weight: 500;
            }

            .cast-modal-loader ion-icon {
                font-size: 3rem;
                color: #f5c518;
                margin-bottom: 16px;
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Setup the Modal Element
    let modalOverlay = document.querySelector('.cast-modal-overlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.className = 'cast-modal-overlay';
        modalOverlay.innerHTML = `
            <div class="cast-modal-container">
                <button class="cast-modal-close" aria-label="Close details">
                    <ion-icon name="close-outline"></ion-icon>
                </button>
                <div class="cast-modal-body"></div>
            </div>
        `;
        document.body.appendChild(modalOverlay);
    }

    const modalBody = modalOverlay.querySelector('.cast-modal-body');
    const modalClose = modalOverlay.querySelector('.cast-modal-close');

    // 3. Helper Functions
    function calculateAge(birthday, deathday) {
        if (!birthday) return null;
        const birthDate = new Date(birthday);
        const endDate = deathday ? new Date(deathday) : new Date();
        let age = endDate.getFullYear() - birthDate.getFullYear();
        const m = endDate.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    function formatBirthDate(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function openModal() {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        // Allow exit animation to finish before clearing content
        setTimeout(() => {
            modalBody.innerHTML = '';
        }, 350);
    }

    // Close on click close button or backdrop
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    // 4. Click Event Delegation for Cast Triggers
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.cast-trigger');
        if (!trigger) return;

        e.preventDefault();
        const personId = trigger.getAttribute('data-id');
        if (!personId) return;

        // Render Loading State
        modalBody.innerHTML = `
            <div class="cast-modal-loader">
                <ion-icon name="sync-outline" class="spin-icon spin"></ion-icon>
                <span>Retrieving Actor Profile...</span>
            </div>
        `;
        openModal();

        // Resolve absolute api path using window.basePath
        const basePath = window.basePath || '';
        const apiPath = `${basePath}/api/person.php?id=${personId}`;

        // Fetch person data
        fetch(apiPath)
            .then(res => {
                if (!res.ok) throw new Error('Failed to retrieve cast data');
                return res.json();
            })
            .then(data => {
                const profileImg = data.profile_path 
                    ? `https://image.tmdb.org/t/p/h632${data.profile_path}` 
                    : `${basePath}/assets/img/fallback-avatar.png`; // Check default fallback or generic inline representation
                
                const formattedBirthDate = formatBirthDate(data.birthday);
                const age = calculateAge(data.birthday, data.deathday);
                const ageText = age ? ` (Age: ${age}${data.deathday ? ' - Deceased' : ''})` : '';
                const birthPlace = data.place_of_birth || 'N/A';
                const bio = data.biography || 'No biography available for this actor.';

                // Sort filmography credits by popularity descending
                let credits = data.combined_credits?.cast || [];
                credits = credits.filter(c => c.poster_path); // Filter out items without posters for aesthetic visual consistency
                credits.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                credits = credits.slice(0, 24); // Limit to top 24 credits for outstanding layouts

                // Build Movie Showcase list
                let filmographyHTML = '';
                if (credits.length > 0) {
                    credits.forEach(credit => {
                        const title = credit.title || credit.name || 'Unknown';
                        const character = credit.character || 'Self';
                        const posterUrl = `https://image.tmdb.org/t/p/w185${credit.poster_path}`;
                        const rating = credit.vote_average ? credit.vote_average.toFixed(1) : null;
                        const mediaType = credit.media_type || 'movie';
                        const detailUrl = `${basePath}/details?id=${credit.id}&type=${mediaType}`;

                        filmographyHTML += `
                            <a href="${detailUrl}" class="cast-movie-card" data-href="${detailUrl}">
                                ${rating ? `
                                <div class="cast-movie-rating-badge">
                                    <ion-icon name="star"></ion-icon>${rating}
                                </div>` : ''}
                                <div class="cast-movie-poster-wrapper">
                                    <img class="cast-movie-poster" src="${posterUrl}" alt="${title}" loading="lazy">
                                </div>
                                <div class="cast-movie-info">
                                    <div class="cast-movie-title">${title}</div>
                                    <div class="cast-movie-character">${character}</div>
                                </div>
                            </a>
                        `;
                    });
                } else {
                    filmographyHTML = `<p style="color: var(--text-secondary); grid-column: span 4;">No credits found for this actor.</p>`;
                }

                // Render dynamic layout
                modalBody.innerHTML = `
                    <div class="cast-modal-content">
                        <!-- Biography Panel -->
                        <div class="cast-modal-bio-panel">
                            <div class="cast-modal-avatar-wrapper">
                                <img class="cast-modal-avatar" src="${profileImg}" alt="${data.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23161827%22/><text x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 font-family=%22sans-serif%22 font-weight=%22bold%22 fill=%22%239ea2c0%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22>${data.name ? data.name.charAt(0) : '?'}</text></svg>'">
                            </div>
                            <h2 class="cast-modal-name">${data.name}</h2>
                            
                            <div class="cast-modal-meta">
                                <p><strong>Born:</strong> ${birthPlace}</p>
                                <p><strong>Birthday:</strong> ${formattedBirthDate}${ageText}</p>
                            </div>
                            
                            <div class="cast-modal-bio-scroll">
                                <p style="margin-bottom:0;">${bio}</p>
                            </div>
                        </div>

                        <!-- Filmography Panel -->
                        <div class="cast-modal-filmography-panel">
                            <h3 class="cast-modal-section-title">Starred In</h3>
                            <div class="cast-modal-slider-wrapper">
                                <button class="cast-slider-btn prev-btn" aria-label="Scroll left">
                                    <ion-icon name="chevron-back-outline"></ion-icon>
                                </button>
                                <div class="cast-modal-slider">
                                    ${filmographyHTML}
                                </div>
                                <button class="cast-slider-btn next-btn" aria-label="Scroll right">
                                    <ion-icon name="chevron-forward-outline"></ion-icon>
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                // 5. Add Horizontal Slider Scroll Interactions
                const slider = modalBody.querySelector('.cast-modal-slider');
                const prevBtn = modalBody.querySelector('.prev-btn');
                const nextBtn = modalBody.querySelector('.next-btn');

                if (slider && prevBtn && nextBtn) {
                    // Show/hide navigation arrows based on scroll state
                    const updateArrowVisibility = () => {
                        const maxScroll = slider.scrollWidth - slider.clientWidth;
                        prevBtn.style.opacity = slider.scrollLeft <= 5 ? '0' : '1';
                        prevBtn.style.pointerEvents = slider.scrollLeft <= 5 ? 'none' : 'auto';
                        
                        nextBtn.style.opacity = slider.scrollLeft >= maxScroll - 5 ? '0' : '1';
                        nextBtn.style.pointerEvents = slider.scrollLeft >= maxScroll - 5 ? 'none' : 'auto';
                    };

                    slider.addEventListener('scroll', updateArrowVisibility);
                    window.addEventListener('resize', updateArrowVisibility);
                    
                    // Initial arrow check
                    setTimeout(updateArrowVisibility, 100);

                    // Slider button actions
                    prevBtn.addEventListener('click', () => {
                        slider.scrollBy({ left: -450, behavior: 'smooth' });
                    });

                    nextBtn.addEventListener('click', () => {
                        slider.scrollBy({ left: 450, behavior: 'smooth' });
                    });
                }

                // 6. Bind Movie Card Click Transition Inside Modal
                modalBody.querySelectorAll('.cast-movie-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        const href = card.getAttribute('data-href');
                        if (href) {
                            e.preventDefault();
                            
                            // Re-use card-clicking visual transition in the filmography cards
                            card.style.transform = 'scale(1.06)';
                            card.style.borderColor = '#f5c518';
                            card.style.boxShadow = '0 12px 30px rgba(245, 197, 24, 0.4)';
                            card.style.zIndex = '5';
                            
                            // Dim other cards in the slider
                            slider.querySelectorAll('.cast-movie-card').forEach(other => {
                                if (other !== card) {
                                    other.style.opacity = '0.25';
                                    other.style.transform = 'scale(0.95)';
                                    other.style.filter = 'blur(1px)';
                                }
                            });

                            // Smooth exit of modal and navigation
                            setTimeout(() => {
                                modalOverlay.classList.remove('active');
                                document.body.style.overflow = '';
                            }, 150);

                            setTimeout(() => {
                                window.location.href = href;
                            }, 250);
                        }
                    });
                });

            })
            .catch(err => {
                console.error(err);
                modalBody.innerHTML = `
                    <div class="cast-modal-loader" style="color: var(--accent);">
                        <ion-icon name="alert-circle-outline" style="color: var(--accent);"></ion-icon>
                        <span>Could not load details. Please try again later.</span>
                    </div>
                `;
            });
    });
});
