from django.db import models
from django.contrib.auth.models import BaseUserManager, Permission
from django.db.models import Q
import uuid
    
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('O email deve ser fornecido')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser precisa ter is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser precisa ter is_superuser=True.')

        return self.create_user(email, password, **extra_fields)
    
    def get_by_group(self, group_name):
        return self.filter(groups__name=group_name)
    
    def get_by_group_and_param(self, group_name: str, param: str):
        return self.filter(
                Q (email__icontains=param) | 
                Q (first_name__icontains=param) |
                Q (last_name__icontains=param), groups__name=group_name
            ).order_by('id')
    
    def get_permissions(self, user_id: str):
        user = self.get(id=uuid.UUID(user_id))

        return list(
                Permission.objects.filter(group__in=user.groups.all())
                .values_list('codename', flat=True)
                .distinct()
        )
