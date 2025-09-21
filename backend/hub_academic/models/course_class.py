import uuid
from django.db import models
from .course import Course

class CourseClass(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    number = models.CharField(max_length=3, unique=True, verbose_name="Número")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='course_class', verbose_name="Curso")
