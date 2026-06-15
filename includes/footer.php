<?php
global $config;
$base_path = $config['BASE_URL'];
?>
    </main>
    <footer class="site-footer">
        <div class="container footer-container">
            <div class="footer-grid">
                <!-- Brand Info Column -->
                <div class="footer-col brand-col">
                    <a href="<?= $base_path ?>/" class="footer-brand">
                        <img src="<?= $base_path ?>/Plotoryx-Logo.png" alt="Plotoryx" class="footer-logo">
                        <span>Plotoryx</span>
                    </a>
                    <p class="footer-desc">
                        Enjoy instant streaming of high-quality movies, TV shows, and anime. Completely free, with multiple streaming servers and clean interfaces.
                    </p>
                    <div class="footer-socials">
                        <a href="#" class="social-link" aria-label="Telegram"><ion-icon name="paper-plane-outline"></ion-icon></a>
                        <a href="#" class="social-link" aria-label="Twitter"><ion-icon name="logo-twitter"></ion-icon></a>
                        <a href="#" class="social-link" aria-label="Discord"><ion-icon name="logo-discord"></ion-icon></a>
                        <a href="#" class="social-link" aria-label="GitHub"><ion-icon name="logo-github"></ion-icon></a>
                    </div>
                </div>

                <!-- Navigation Column -->
                <div class="footer-col links-col">
                    <h4 class="footer-title">Navigation</h4>
                    <ul class="footer-links">
                        <li><a href="<?= $base_path ?>/">Home</a></li>
                        <li><a href="<?= $base_path ?>/movies">Movies</a></li>
                        <li><a href="<?= $base_path ?>/tv">TV Shows</a></li>
                        <li><a href="<?= $base_path ?>/genres">Genres</a></li>
                        <li><a href="<?= $base_path ?>/trending">Trending</a></li>
                    </ul>
                </div>

                <!-- Support Column -->
                <div class="footer-col links-col">
                    <h4 class="footer-title">Support</h4>
                    <ul class="footer-links">
                        <li><a href="<?= $base_path ?>/favorites">Watchlist</a></li>
                        <li><a href="#">FAQ</a></li>
                        <li><a href="#">DMCA Policy</a></li>
                        <li><a href="#">Terms of Service</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                    </ul>
                </div>

                <!-- Donate / QR Code Column -->
                <div class="footer-col donate-col">
                    <h4 class="footer-title">Support Plotoryx</h4>
                    <p class="donate-desc">Help us keep the servers running and ad-free! Scan the QR Code to donate.</p>
                    <div class="qr-container">
                        <div class="qr-wrapper">
                            <img src="<?= $base_path ?>/QRCode.png" alt="Donate QR Code" class="qr-image">
                            <!-- Laser scan line animation -->
                            <div class="qr-scan-line"></div>
                        </div>
                        <div class="qr-badge">
                            <ion-icon name="cafe-outline"></ion-icon>
                            <span>Buy us a Coffee</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Copyright & Utilities -->
            <div class="footer-bottom">
                <div class="copyright">
                    <p>&copy; <?= date('Y') ?> <span>PlotoryxMovie</span>. All rights reserved.</p>
                </div>
                <div class="footer-meta-info">
                    <p>Made with <ion-icon name="heart" class="heart-icon"></ion-icon> for cinephiles.</p>
                    <button class="back-to-top" id="backToTopBtn" aria-label="Back to top">
                        <ion-icon name="arrow-up-outline"></ion-icon>
                    </button>
                </div>
            </div>
        </div>
    </footer>

    <!-- QR Code Expand Modal Overlay -->
    <div class="qr-modal-overlay" id="qrModal">
        <div class="qr-modal-container">
            <button class="qr-modal-close" id="closeQrModalBtn" aria-label="Close QR Code">
                <ion-icon name="close-outline"></ion-icon>
            </button>
            <div class="qr-modal-content">
                <h3 class="qr-modal-title">Support Plotoryx</h3>
                <p class="qr-modal-desc">Scan, screenshot, or save this QR code to help support the site!</p>
                <div class="qr-modal-image-wrapper">
                    <img src="<?= $base_path ?>/QRCode.png" alt="Donate QR Code Large" class="qr-modal-image">
                </div>
                <a href="<?= $base_path ?>/QRCode.png" download="Plotoryx-Donate-QR.png" class="btn btn-primary qr-download-btn">
                    <ion-icon name="download-outline" style="font-size:1.25rem; margin-right:4px;"></ion-icon> Download Image
                </a>
            </div>
        </div>
    </div>
    
    <script src="<?= $base_path ?>/assets/js/app.js?v=2.0"></script>
    <script src="<?= $base_path ?>/assets/js/api.js?v=2.0"></script>
    <script src="<?= $base_path ?>/assets/js/cast-modal.js?v=2.0"></script>
    <script>
        // Back to top smooth scroll functionality
        const backToTopBtn = document.getElementById('backToTopBtn');
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
            // Show/hide button on scroll
            window.addEventListener('scroll', () => {
                if (window.scrollY > 500) {
                    backToTopBtn.classList.add('visible');
                } else {
                    backToTopBtn.classList.remove('visible');
                }
            });
        }

        // QR Code Modal expand/collapse functionality
        const qrWrapper = document.querySelector('.qr-wrapper');
        const qrModal = document.getElementById('qrModal');
        const closeQrModalBtn = document.getElementById('closeQrModalBtn');

        if (qrWrapper && qrModal && closeQrModalBtn) {
            const openQrModal = () => {
                qrModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            };

            const closeQrModal = () => {
                qrModal.classList.remove('active');
                document.body.style.overflow = '';
            };

            qrWrapper.addEventListener('click', openQrModal);
            closeQrModalBtn.addEventListener('click', closeQrModal);
            
            qrModal.addEventListener('click', (e) => {
                if (e.target === qrModal) {
                    closeQrModal();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && qrModal.classList.contains('active')) {
                    closeQrModal();
                }
            });
        }
    </script>
</body>
</html>
