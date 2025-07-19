import uuid
from django.db import models

class Subject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    objective = models.TextField()
    menu = models.TextField()

