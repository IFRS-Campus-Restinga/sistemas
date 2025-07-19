import uuid
from django.db import models
from ..enums.course_category import CourseCategory
from hub_users.models import CustomUser

class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    workload = models.IntegerField()
    category = models.CharField(choices=CourseCategory.choices, max_length=35)
    coord = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
