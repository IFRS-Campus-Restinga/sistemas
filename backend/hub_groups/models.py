import uuid
from django.db import models
from django.contrib.auth.models import Group

# Create your models here.
class GroupUUIDMap(models.Model):
    group = models.OneToOneField(Group, on_delete=models.CASCADE, related_name="uuid_map")
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)