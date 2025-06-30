from django.db.models import Q
from rest_framework import serializers
from users.serializers.custom_user_serializer import CustomUserSerializer
from .password_service import PasswordService
from users.models import *
from django.contrib.auth.models import Permission, Group
from django.db import transaction

class UserValidationException(Exception):
    pass

class UserService:
    @staticmethod
    @transaction.atomic
    def create_user(email: str, first_name: str, last_name: str, group_name: str, password: str = None) -> CustomUser:
        try:
            if password:
                if group_name != 'convidado':
                    raise UserValidationException('Servidores e alunos podem autenticar apenas pela conta google')
                
                user_serializer = CustomUserSerializer(data={'email': email, 'first_name': first_name, 'last_name': last_name})

                if not user_serializer.is_valid():
                    raise serializers.ValidationError(user_serializer.errors)

            user, created = CustomUser.objects.get_or_create(email=email, defaults={
                'first_name': first_name,
                'last_name': last_name
            })

            if created:
                UserService.add_group(user, group_name)

                if password:
                    PasswordService.create(user, password)

            return user
        except serializers.ValidationError as e:
            raise e

    @staticmethod
    def add_group(user: CustomUser, group_name: str) -> None:
        group = Group.objects.get(name=group_name)

        if not group:
            raise Group.DoesNotExist
        
        user.groups.add(group)
        user.save()

    @staticmethod
    def build_user_data(user: CustomUser, picture=None):
        return {
            'id': user.id,
            'username': f'{user.first_name} {user.last_name}',
            'first_login': user.first_login,
            'profile_picture': picture,
            'groups': [group.name for group in user.groups.all()],
        }