import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from hub_users.managers.user_manager import UserManager
from django.contrib.auth.models import AbstractUser
from hub_users.enums.categories import Categories
from hub_users.enums.access_profile import AcessProfile

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, verbose_name="Email")
    username = models.CharField(max_length=100, verbose_name="Nome")
    date_joined = models.DateTimeField(auto_now_add=True, verbose_name="Data de entrada")
    is_abstract = models.BooleanField(default=False, verbose_name="Tipo de conta")
    first_login = models.BooleanField(default=True, verbose_name="Primeiro login")
    access_profile = models.CharField(choices=AcessProfile.choices, max_length=12, verbose_name="Perfil de acesso")
    is_active = models.BooleanField(default=False, verbose_name="Status")
    email_verified = models.BooleanField(default=True, verbose_name="Email confirmado")
    personal_infos = models.ForeignKey(
        "PersonalInfos",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="users",
        verbose_name="Dados pessoais",
    )
    account_infos = models.ForeignKey(
        "AccountInfos",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="users",
        verbose_name="Dados da conta",
    )

    last_login = None
    password = None
    user_permissions = None
    first_name = None
    last_name = None

    objects = UserManager()
    
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
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='custom_password')


class AccessRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="access_request",
        verbose_name="Usuário",
    )

class EmailConfirmation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    confirmation_code = models.CharField(max_length=6, verbose_name="Código de confirmação")
    expires_at = models.DateTimeField(verbose_name="Data de expiração")
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="email_confirmation",
        verbose_name="Usuário",
    )


class BindRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bind_requests",
        verbose_name=_("User"),
    )
    personal_infos = models.ForeignKey(
        "PersonalInfos",
        on_delete=models.CASCADE,
        related_name="bind_requests",
        verbose_name=_("Personal information"),
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "personal_infos"],
                name="unique_bindrequest_user_personal_infos",
            )
        ]


class PersonalInfos(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    birth_date = models.DateField(verbose_name="Data de nascimento")
    cpf = models.CharField(max_length=11, verbose_name="CPF", unique=True)


class AccountInfos(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    telephone_number = models.CharField(max_length=13, null=False, blank=False, verbose_name="Telefone")
    registration = models.CharField(max_length=11, null=True, blank=True, unique=True, verbose_name="Matrícula")
