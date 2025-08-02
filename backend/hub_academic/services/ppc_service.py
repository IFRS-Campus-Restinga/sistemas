# services/ppc_service.py
import uuid
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from ..models.ppc import PPC, Curriculum
from ..serializers.ppc_serializer import PPCSerializer, CurriculumSerializer
from rest_framework.pagination import PageNumberPagination


class PPCPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 30

class PPCService:
    @staticmethod
    @transaction.atomic
    def create(ppc_data):
        serializer = PPCSerializer(data=ppc_data, context={'request': None})

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)

        return serializer.save()

    @staticmethod
    def get(request, ppc_id):
        ppc = get_object_or_404(PPC, pk=uuid.UUID(ppc_id))
        serializer = PPCSerializer(instance=ppc, context={'request': request})
        return serializer.data

    @staticmethod
    def list(request):
        queryset = PPC.objects.filter(title__icontains=request.GET.get('search', ''))
        paginator = PPCPagination()
        paginated = paginator.paginate_queryset(queryset, request)
        serializer = PPCSerializer(paginated, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    @staticmethod
    @transaction.atomic
    def edit(ppc_data, ppc_id):
        curriculum_data = ppc_data.pop('curriculum', [])

        ppc = get_object_or_404(PPC, pk=uuid.UUID(ppc_id))

        serializer = PPCSerializer(instance=ppc, data={**ppc_data, 'curriculum': curriculum_data}, context={'request': None})

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)

        return PPCSerializer(instance=ppc, context={'request': None}).data
