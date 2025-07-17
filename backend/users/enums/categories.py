from django.db.models import TextChoices

class Categories(TextChoices):
    EMI = 'Integrado'
    ProEJA = 'ProEJA'
    GERAL = 'Geral'