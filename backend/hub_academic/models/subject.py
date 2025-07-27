import uuid
from django.db import models

class Subject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    shortname = models.CharField(max_length=7, unique=True)
    objective = models.TextField()
    menu = models.TextField()

    def __str__(self):
        return self.name

