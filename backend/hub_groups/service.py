import uuid
from django.db.models import Q
from django.contrib.auth.models import Group, Permission
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from .serializer import GroupSerializer, format_string
from rest_framework.pagination import PageNumberPagination

class GroupPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 30

class GroupService:
    @staticmethod
    def create(group_data) -> Group:
        group_data.pop('permissionsToRemove', [])
        permission_uuids = [perm['id'] for perm in group_data.pop('permissionsToAdd', [])]

        # Formata o nome
        raw_name = group_data.get('name')
        formatted_name = format_string(raw_name)

        # Verifica se o grupo já existe
        group = Group.objects.filter(name=formatted_name).first()
        if group:
            return group  # Apenas retorna, sem erro e sem usar o serializer

        # Busca as permissões
        new_permissions = list(Permission.objects.filter(uuid_map__uuid__in=permission_uuids))

        # Usa o serializer apenas para criação do novo grupo
        serializer = GroupSerializer(data={
            'name': raw_name,
            'permissions_to_add': [p.pk for p in new_permissions]
        })

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)

        serializer.save()
        return serializer.instance

    @staticmethod
    def edit(group_data, group_id: str):
        group = get_object_or_404(Group, uuid_map__uuid=uuid.UUID(group_id))

        add_permission_uuids = [perm['id'] for perm in group_data.pop('permissionsToAdd', [])]
        remove_permission_uuids = [perm['id'] for perm in group_data.pop('permissionsToRemove', [])]

        permissions_to_add = list(Permission.objects.filter(uuid_map__uuid__in=add_permission_uuids))
        permissions_to_remove = list(Permission.objects.filter(uuid_map__uuid__in=remove_permission_uuids))

        serializer = GroupSerializer(
            instance=group, 
            data={
                'name': group_data.get('name'),
                'permissions_to_add': [p.pk for p in permissions_to_add],
                'permissions_to_remove': [p.pk for p in permissions_to_remove]
            }
        )

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)

        serializer.save()

    @staticmethod
    def list(request):
        search = request.GET.get('search', '')
        groups = Group.objects.filter(name__icontains=search)

        paginator = GroupPagination()
        paginated_result = paginator.paginate_queryset(groups, request)

        serializer = GroupSerializer(paginated_result, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
    
    @staticmethod
    def list_available(request, user_id):    
        groups = Group.objects.exclude(user__id=uuid.UUID(user_id))

        paginator = GroupPagination()
        paginated_result = paginator.paginate_queryset(groups, request)

        serializer = GroupSerializer(paginated_result, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    @staticmethod
    def get_group_data(group_id: str, request):
        group = get_object_or_404(Group, uuid_map__uuid=uuid.UUID(group_id))
        serializer = GroupSerializer(instance=group, context={'request': request})
        return serializer.data

    @staticmethod
    def get_by_user_and_system(user, system):
        return list(
            Group.objects.filter(
                Q(id__in=user.groups.values_list('id', flat=True)) &
                Q(id__in=system.groups.values_list('id', flat=True))
            ).values_list('name', flat=True)
        )
    
    @staticmethod
    def get_by_name(name):
        return Group.objects.filter(name=name).first()
