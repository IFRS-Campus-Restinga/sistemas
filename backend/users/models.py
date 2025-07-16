import uuid
from django.db import models
from users.managers.user_manager import CustomUserManager
from django.contrib.auth.models import AbstractUser, Permission, Group
from users.enums.categories import Categories
from users.enums.access_profile import AcessProfile

class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    first_login = models.BooleanField(default=True)
    access_profile = models.CharField(choices=AcessProfile.choices, max_length=12)

    last_login = None
    password = None
    username = None
    user_permissions = None

    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f'{self.first_name} {self.last_name}' or self.email
    
class Password(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    password = models.CharField(max_length=128)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='custom_password')
    
class StudentAdditionalInfos(models.Model):
    category = models.CharField(choices=Categories.choices, max_length=15, null=False, blank=False)
    birth_date = models.DateField()
    telephone_number = models.CharField(max_length=13, null=False, blank=False)
    registration = models.CharField(max_length=30, null=False, blank=False)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
