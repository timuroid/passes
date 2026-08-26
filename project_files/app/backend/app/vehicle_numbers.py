import re


# Буквы, допустимые на российских регистрационных знаках и визуально
# совпадающие с латиницей. Это не фонетическая транслитерация.
VISUAL_EQUIVALENTS = str.maketrans({
    "А": "A", "В": "B", "Е": "E", "К": "K", "М": "M", "Н": "H",
    "О": "O", "Р": "P", "С": "C", "Т": "T", "У": "Y", "Х": "X",
})


def normalize_vehicle_search(value: str) -> str:
    """Build a stable search key while retaining the original displayed number."""
    compact = re.sub(r"[\s-]+", "", value.strip()).upper()
    return compact.translate(VISUAL_EQUIVALENTS)
