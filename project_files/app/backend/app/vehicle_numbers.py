import re


# Буквы, допустимые на российских регистрационных знаках и визуально
# совпадающие с латиницей. Это не фонетическая транслитерация.
VISUAL_EQUIVALENTS = str.maketrans({
    "А": "A", "В": "B", "Е": "E", "К": "K", "М": "M", "Н": "H",
    "О": "O", "Р": "P", "С": "C", "Т": "T", "У": "Y", "Х": "X",
})


def normalize_vehicle_search(value: str) -> str:
    """Build a stable key and equate visually matching Cyrillic and Latin letters."""
    compact = re.sub(r"[\s-]+", "", value.strip()).upper()
    return compact.translate(VISUAL_EQUIVALENTS)


def normalize_vehicle_input(value: str) -> str:
    """Normalize driver input to the Latin-only format accepted by the kiosk."""
    normalized = re.sub(r"[\s-]+", "", value.strip()).upper().translate(VISUAL_EQUIVALENTS)
    if not re.fullmatch(r"[A-Z0-9]+", normalized):
        raise ValueError("Допустимы латинские буквы и цифры")
    return normalized
