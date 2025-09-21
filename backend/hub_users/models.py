import uuid
from django.db import models
from hub_users.managers.user_manager import CustomUserManager
from django.contrib.auth.models import AbstractUser
from hub_users.enums.categories import Categories
from hub_users.enums.access_profile import AcessProfile

class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, verbose_name="Email")
    username = models.CharField(max_length=100, verbose_name="Nome")
    date_joined = models.DateTimeField(auto_now_add=True, verbose_name="Data de entrada")
    is_abstract = models.BooleanField(default=False, verbose_name="Tipo de conta")
    first_login = models.BooleanField(default=True, verbose_name="Primeiro login")
    access_profile = models.CharField(choices=AcessProfile.choices, max_length=12, verbose_name="Perfil de acesso")
    is_active = models.BooleanField(default=False, verbose_name="Status")

    last_login = None
    password = None
    user_permissions = None
    first_name = None
    last_name = None

    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f'{self.username}' or self.email
    
    @property
    def status(self):
        return "Ativo" if self.is_active else "Inativo"
    
class Password(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    password = models.CharField(max_length=128, verbose_name="Senha")
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='custom_password')
    
class AdditionalInfos(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    birth_date = models.DateField(verbose_name="Data de nascimento")
    telephone_number = models.CharField(max_length=13, null=False, blank=False, verbose_name="Telefone")
    registration = models.CharField(max_length=11, null=True, blank=True, verbose_name="Matrícula")
    cpf = models.CharField(max_length=11, verbose_name="CPF", unique=True)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='additional_infos')
