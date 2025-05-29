import uuid
from django.db import models
from apps_manager.enums import CurrentState
from google_auth.models import CustomUser

# Create your models here.
class App(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, null=False, blank=False)
    app_url = models.URLField(max_length=255, null=False, blank=False)
    is_active = models.BooleanField()
    current_state = models.CharField(choices=CurrentState.choices, blank=False, null=False, max_length=20)
    dev_team = models.ManyToManyField(CustomUser)