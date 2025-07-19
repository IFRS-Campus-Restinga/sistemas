from django.db.models import TextChoices

class CurrentState(TextChoices):
    DEV = 'Em desenvolvimento'
    DEPLOYED = 'Implantado'