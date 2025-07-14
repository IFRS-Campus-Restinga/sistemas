import uuid
from django.db import models
from django.contrib.auth.models import Permission

# Create your models here.
class PermissionUUIDMap(models.Model):
    permission = models.OneToOneField(Permission, on_delete=models.CASCADE, related_name="uuid_map")
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)