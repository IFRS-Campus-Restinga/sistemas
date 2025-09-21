import uuid
from django.db import models

class Subject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name="Disciplina")
    code = models.CharField(max_length=15, unique=True, verbose_name="Código")
    objective = models.TextField(verbose_name="Objetivo geral")
    menu = models.TextField(verbose_name="Ementa")
    created_at = models.DateField(auto_now_add=True, verbose_name="Data de criação")

    def __str__(self):
        return self.name

