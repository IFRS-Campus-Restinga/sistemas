import uuid
from django.db import models
from ..enums.course_category import CourseCategory
from hub_users.models import CustomUser

class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome")
    workload = models.IntegerField(verbose_name="Carga Horária")
    category = models.CharField(choices=CourseCategory.choices, max_length=37, verbose_name="Categoria")
    coord = models.ForeignKey(CustomUser, on_delete=models.CASCADE, verbose_name="Coordenador")

    def __str__(self):
        return self.name
