import uuid
from django.db import models
from hub_systems.enums import CurrentState
from hub_users.models import CustomUser

class System(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, null=False, blank=False, unique=True, verbose_name="Nome")
    system_url = models.URLField(max_length=255, null=False, blank=False, verbose_name="URL do sistema")
    is_active = models.BooleanField(verbose_name="Status")
    api_key = models.CharField(max_length=255, verbose_name="Chave de API")
    current_state = models.CharField(choices=CurrentState.choices, blank=False, null=False, max_length=20, verbose_name="Estado atual")
    secret_key = models.CharField(max_length=200, null=False, blank=False, verbose_name="Chave secreta")
    dev_team = models.ManyToManyField(CustomUser, verbose_name="Equipe DEV")

    def __str__(self):
        return f'{self.name} | {self.current_state}'