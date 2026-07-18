import os

filepath = "app/globals.css"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

target = """/* --- Styles extracted from pages/details.php --- */
    border-radius: 16px;"""

replacement = """/* --- Styles extracted from pages/details.php --- */

.details-hero {
    position: relative;
    padding-top: 140px;
    padding-bottom: 60px;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: fixed;
    min-height: 85vh;
    display: flex;
    align-items: center;
}
.details-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(6,7,12,0.98) 0%, rgba(6,7,12,0.85) 50%, rgba(6,7,12,0.4) 100%),
                linear-gradient(to top, var(--bg-main) 0%, rgba(6,7,12,0) 25%);
}
.details-content {
    position: relative;
    z-index: 2;
    display: flex;
    gap: 48px;
    align-items: center;
}
.poster-container {
    flex: 0 0 320px;
    max-width: 320px;
    position: relative;
    border-radius: 16px;"""

if target in content:
    content = content.replace(target, replacement)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully fixed globals.css styling!")
else:
    # Try with different whitespace just in case
    target_alt = "/* --- Styles extracted from pages/details.php --- */\n    border-radius: 16px;"
    if target_alt in content:
        content = content.replace(target_alt, replacement)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print("Successfully fixed globals.css styling (alternate target)!")
    else:
        print("Target pattern not found in globals.css")
