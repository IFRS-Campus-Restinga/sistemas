import uuid
from django.db import models
from .subject import Subject
from .course import Course

class PPC(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100, unique=True, verbose_name="Título")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, verbose_name="Curso")
    created_at = models.DateField(auto_now_add=True, verbose_name="Data de criação")

    def __str__(self):
        return self.title

class Curriculum(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ppc = models.ForeignKey(PPC, on_delete=models.CASCADE, related_name='curriculum', verbose_name="PPC")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='ppc', verbose_name="Disciplina")
    period = models.IntegerField(verbose_name="Período")
