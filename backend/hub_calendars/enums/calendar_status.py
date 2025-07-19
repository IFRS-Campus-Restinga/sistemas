from django.db.models import TextChoices

class CalendarStatus(TextChoices):
    ATIVO = 'Ativo'
    SUSPENSO = 'Suspenso'
    CANCELADO = 'Cancelado'