import random
import re
import unicodedata

from django.conf import settings

from ..models.subject import Subject


def _subject_acronym(name: str) -> str:
    normalized = unicodedata.normalize("NFKD", name)
    letters = re.sub(r"[^A-Za-z]", "", normalized.encode("ascii", "ignore").decode())
    return (letters.upper() + "XXX")[:3]


def generate_subject_code(name: str) -> str:
    campus_code = settings.CAMPUS_CODE
    if not re.fullmatch(r"[A-Z]{3}", campus_code):
        raise ValueError("CAMPUS_CODE deve conter exatamente três letras maiúsculas.")

    acronym = _subject_acronym(name)
    while True:
        code = f"{campus_code}-{acronym}{random.randint(0, 999):03d}"
        if not Subject.objects.filter(code=code).exists():
            return code