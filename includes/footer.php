<?php
global $config;
$base_path = $config['BASE_URL'];
?>
    </main>
    <footer>
        <div class="container" style="padding: 40px 20px; text-align: center; color: var(--text-secondary); border-top: 1px solid var(--border-color); margin-top: 50px;">
            <p>&copy; <?= date('Y') ?> PlotoryxMovie. All rights reserved.</p>
        </div>
    </footer>
    
    <script src="<?= $base_path ?>/assets/js/app.js?v=1.4"></script>
    <script src="<?= $base_path ?>/assets/js/api.js?v=1.4"></script>
</body>
</html>
