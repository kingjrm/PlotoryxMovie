<?php
// Determine the base path for assets
global $config;
$base_path = $config['BASE_URL'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PlotoryxMovie | Premium Streaming</title>
    <link rel="icon" type="image/png" href="<?= $base_path ?>/Plotoryx-Logo.png">
    
    <!-- Meta/SEO includes can go here -->
    <?php include 'seo.php'; ?>
    
    <script>
        window.basePath = "<?= $base_path ?>";
    </script>
    
    <link rel="stylesheet" href="<?= $base_path ?>/assets/css/variables.css?v=1.5">
    <link rel="stylesheet" href="<?= $base_path ?>/assets/css/global.css?v=1.5">
    <link rel="stylesheet" href="<?= $base_path ?>/assets/css/animations.css?v=1.5">
    <link rel="stylesheet" href="<?= $base_path ?>/assets/css/navbar.css?v=1.5">
    <link rel="stylesheet" href="<?= $base_path ?>/assets/css/cards.css?v=1.5">
    
    <!-- Optional: Ionicons or FontAwesome for icons -->
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
    <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
</head>
<body>
    <?php include 'navbar.php'; ?>
    <main>
