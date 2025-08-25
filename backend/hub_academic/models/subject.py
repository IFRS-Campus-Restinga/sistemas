import uuid
from django.db import models

class Subject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=15, unique=True)
    objective = models.TextField()
    menu = models.TextField()
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name

