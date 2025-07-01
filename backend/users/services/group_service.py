from django.contrib.auth.models import Group, Permission
from django.shortcuts import get_object_or_404
from users.models import GroupUUIDMap
from rest_framework import serializers
from django.db import transaction
from users.serializers.group_serializer import GroupSerializer


class GroupService:
    @staticmethod
    @transaction.atomic
    def create(group_name) -> Group:
        if not group_name:
            raise serializers.ValidationError("O nome do grupo é obrigatório.")

        group, created = Group.objects.get_or_create(name=group_name)

        if created:
            group_map = GroupUUIDMap.objects.create(group=group)

        return group
    
    @staticmethod
    def set_group_data(group_data, group_id: str):
        group = get_object_or_404(Group, uuid_map__uuid=group_id)

        group_name = group_data['name']
        permissions_uuids = [perm['id'] for perm in group_data['permissions']]

        permissions = Permission.objects.filter(
            uuid_map__uuid__in=permissions_uuids
        ).values_list('id', flat=True)

        serializer = GroupSerializer(instance=group, data={'name': group_name, 'permissions': permissions})

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)

        serializer.save()

    @staticmethod
    def get_group_data(group_id: str, request):
        group = get_object_or_404(Group, uuid_map__uuid=group_id)

        serializer = GroupSerializer(instance=group, context={'request': request})

        return serializer.data


