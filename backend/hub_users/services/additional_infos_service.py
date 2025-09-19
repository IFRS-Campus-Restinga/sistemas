import uuid
from django.shortcuts import get_object_or_404
from ..models import AdditionalInfos
from ..serializers.additional_infos_serializer import AdditionalInfosSerializer
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework import serializers, status
from rest_framework.pagination import PageNumberPagination

class AdditionalInfosPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 30

class AccessDeniedException(Exception):
    pass

class AdditionalInfosService:
    @staticmethod
    def create(request):
        serializer = AdditionalInfosSerializer(data=request.data, context={'request': request})

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

        return serializer.instance
    
    @staticmethod
    def get(request, user_id):
        user_infos = get_object_or_404(AdditionalInfos, user_id=uuid.UUID(user_id))

        serializer = AdditionalInfosSerializer(instance=user_infos, context={'request': request})

        return serializer.data
    
    @staticmethod
    def edit(request, user_id):
        user_infos = get_object_or_404(AdditionalInfos, user=uuid.UUID(user_id))

        serializer = AdditionalInfosSerializer(instance=user_infos, data=request.data, context={'request': request})

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()