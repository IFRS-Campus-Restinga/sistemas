from django.db.models import TextChoices

class SignUpRequestStatus(TextChoices):
    PENDING = 'Pendente'
    APPROVED = 'Aprovado'