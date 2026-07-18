# PowerShell script to extract style blocks from original PHP files and append them to app/globals.css

$globalsPath = "app/globals.css"

# Function to extract and append style block
function Append-StyleBlock($filePath) {
    if (Test-Path $filePath) {
        Write-Host "Extracting styles from $filePath..."
        $content = Get-Content $filePath -Raw
        # Matches <style> ... </style> (case-insensitive)
        $pattern = '(?si)<style\b[^>]*>(.*?)</style>'
        
        $matches = [regex]::Matches($content, $pattern)
        foreach ($match in $matches) {
            $styleContent = "`n/* --- Styles extracted from $filePath --- */`n" + $match.Groups[1].Value + "`n"
            $styleContent | Out-File $globalsPath -Append -Encoding utf8
            Write-Host "Appended styles from $filePath to $globalsPath"
        }
    } else {
        Write-Warning "File not found: $filePath"
    }
}

# Append styles from all pages
Append-StyleBlock "pages/home.php"
Append-StyleBlock "pages/details.php"
Append-StyleBlock "pages/watch.php"
Append-StyleBlock "pages/genres.php"

Write-Host "Done extracting all page styles!"
