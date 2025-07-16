from django.db.models import TextChoices

class AcessProfile(TextChoices):
    ALUNO = 'aluno'
    SERVIDOR = 'servidor'
    CONVIDADO = 'convidado'