from django.db.models import Q
from django.contrib.auth.models import Group, Permission
from django.shortcuts import get_object_or_404
from .models import GroupUUIDMap
from rest_framework import serializers
from django.db import transaction
from .serializer import GroupSerializer
from rest_framework.pagination import PageNumberPagination

class GroupPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 30

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
    def edit(group_data, group_id: str):
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
    def list(request):
        groups = Group.objects.filter(name__icontains=request.GET.get('param', ''))

        if not groups.exists():
            paginator = GroupPagination()
            paginated_result = paginator.paginate_queryset([], request)
            return paginator.get_paginated_response(paginated_result)
        
        paginator = GroupPagination()
        paginated_result = paginator.paginate_queryset(groups, request)

        serializer = GroupSerializer(paginated_result, many=True, context={'request': request})

        return paginator.get_paginated_response(serializer.data)

    @staticmethod
    def get_group_data(group_id: str, request):
        group = get_object_or_404(Group, uuid_map__uuid=group_id)

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


