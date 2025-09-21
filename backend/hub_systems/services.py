import uuid
from django.shortcuts import get_object_or_404
from hub_groups.service import GroupService
from hub_auth.services.token_service import TokenService
from hub_systems.serializer import SystemSerializer
from rest_framework import serializers
from django.db import transaction
from hub_systems.models import System
from rest_framework.response import Response
from rest_framework import serializers, status
from rest_framework.pagination import PageNumberPagination

class SystemPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 30

class SystemService:
    @staticmethod
    @transaction.atomic
    def create(system_data):
        serializer = SystemSerializer(data=system_data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

        return serializer.instance
    
    @staticmethod
    def get_data(request, system_id):
        system = get_object_or_404(System, pk=uuid.UUID(system_id))

        serializer = SystemSerializer(instance=system, context={'request': request})

        return serializer.data
    
    @staticmethod
    def list(request):
        systems = System.objects.all()

        if not systems:
            return Response({'results': []}, status=status.HTTP_200_OK)

        paginator = SystemPagination()
        paginated_result = paginator.paginate_queryset(systems, request)

        serializer = SystemSerializer(paginated_result, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
    
    @staticmethod
    @transaction.atomic
    def edit(system_data, system_id):
        system = get_object_or_404(System, pk=uuid.UUID(system_id))

        serializer = SystemSerializer(instance=system, data=system_data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()