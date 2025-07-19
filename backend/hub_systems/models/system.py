import uuid
from django.db import models
from hub_systems.enums import CurrentState
from hub_users.models import CustomUser
from django.contrib.auth.models import Group
from hub_systems.managers.system_managers import *

class System(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, null=False, blank=False, unique=True)
    system_url = models.URLField(max_length=255, null=False, blank=False)
    is_active = models.BooleanField()
    current_state = models.CharField(choices=CurrentState.choices, blank=False, null=False, max_length=20)
    secret_key = models.CharField(max_length=200, null=False, blank=False)
    dev_team = models.ManyToManyField(CustomUser)
    groups = models.ManyToManyField(Group)

    objects = SystemManager()

    def __str__(self):
        return f'{self.name} | {self.current_state}'