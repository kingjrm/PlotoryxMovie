import os

filepath = "app/globals.css"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

target = """}
    font-size: 1.2rem;
    transition: all 0.2s ease;
    z-index: 10;
}"""

replacement = """}

.roulette-modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.2s ease;
    z-index: 10;
}"""

if target in content:
    content = content.replace(target, replacement)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully fixed globals.css roulette close styles!")
else:
    # Try with different whitespace/newlines
    target_alt = "}\n    font-size: 1.2rem;\n    transition: all 0.2s ease;\n    z-index: 10;\n}"
    if target_alt in content:
        content = content.replace(target_alt, replacement)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print("Successfully fixed globals.css roulette close styles (alternate target)!")
    else:
        print("Target pattern not found in globals.css")
