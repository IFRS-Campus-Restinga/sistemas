import uuid
from django.db import models
from django.core.validators import RegexValidator

subject_code_validator = RegexValidator(
    regex=r"^[A-Z]{3}-[A-Z]{3}[0-9]{3}$",
    message="O código deve seguir o padrão ABC-AAA000.",
)

class Subject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name="Disciplina")
    code = models.CharField(
        max_length=10,
        unique=True,
        validators=[subject_code_validator],
        verbose_name="Código",
    )
    objective = models.TextField(verbose_name="Objetivo geral")
    menu = models.TextField(verbose_name="Ementa")
    created_at = models.DateField(auto_now_add=True, verbose_name="Data de criação")
    subject_teach_workload = models.IntegerField(default=0, verbose_name="Carga horária de ensino")
    subject_ext_workload = models.IntegerField(default=0, verbose_name="Carga horária de extensão")
    subject_remote_workload = models.IntegerField(default=0, verbose_name="Carga horária remota")
    weekly_periods = models.IntegerField(default=0, verbose_name="Períodos semanais")
    pre_requisits = models.ManyToManyField(
        "self",
        symmetrical=False,
        blank=True,
        verbose_name="Pré-requisitos",
    )

    @property
    def total_workload(self):
        return (
            self.subject_teach_workload +
            self.subject_ext_workload +
            self.subject_remote_workload
        )

    @property
    def real_teach_workload(self):
        return self.subject_teach_workload * 0.83333333

    @property
    def real_ext_workload(self):
        return self.subject_ext_workload * 0.83333333

    @property
    def real_remote_workload(self):
        return self.subject_remote_workload * 0.83333333

    def __str__(self):
        return self.name

