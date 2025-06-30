from django.contrib.auth.models import Group, Permission
from rest_framework import serializers
from django.db import transaction


class GroupService:
    @staticmethod
    @transaction.atomic
    def create(group_name) -> Group:
        if not group_name:
            raise serializers.ValidationError("O nome do grupo é obrigatório.")

        group, _ = Group.objects.get_or_create(name=group_name)

        return group
    
    @staticmethod
    def set_group_permissions(group_name: str, permissions_codenames: list[str]):
        group = Group.objects.get(name=group_name)

        permissions = Permission.objects.filter(codename__in=permissions_codenames)

        group.permissions.set(permissions)

        GroupService.set_admin_permisisons(permissions)

    @staticmethod
    def set_admin_permisisons(permissions: list[Permission]):
        admin = Group.objects.get(name='admin')

        admin.permissions.add(permissions)
