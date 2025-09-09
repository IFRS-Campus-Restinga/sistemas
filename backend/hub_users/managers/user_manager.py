import uuid
from django.db.models import Q
from django.contrib.auth.models import BaseUserManager, Permission
    
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
    
    def get_by_group(self, group_name, is_active=None):
        queryset = self.filter(groups__name=group_name)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active)
        return queryset
        
    def get_by_access_profile(self, access_profile_name, is_active=None):
        queryset = self.filter(access_profile=access_profile_name)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active)
        return queryset
    
    def get_by_group_and_param(self, group_name: str, param: str, is_active=None):
        queryset = self.filter(
                Q (email__icontains=param) | 
                Q (username__icontains=param), 
                groups__name=group_name
            ).order_by('id')
        
        if is_active:
            queryset = queryset.filter(is_active=is_active)

        return queryset
    
    def get_by_access_profile_and_param(self, access_profile_name: str, param: str, is_active=None):
        queryset = self.filter(
                Q (email__icontains=param) | 
                Q (username__icontains=param), 
                access_profile=access_profile_name 
            ).order_by('id')
        
        if is_active:
            queryset = queryset.filter(is_active=is_active)

        return queryset
    
    def get_permissions(self, user_id: str):
        user = self.get(id=uuid.UUID(user_id))

        return list(
                Permission.objects.filter(group__in=user.groups.all())
                .values_list('codename', flat=True)
                .distinct()
        )
