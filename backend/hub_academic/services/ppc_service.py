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

class CurriculumService:
    @staticmethod
    def bulk_create(ppc_id, curriculum_data):
        for item in curriculum_data:
            item['ppc'] = str(ppc_id)  # Certifique-se de usar string se o serializer espera UUID como string

        serializer = CurriculumSerializer(data=curriculum_data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

    @staticmethod
    def bulk_update(curriculum_data):
        for item in curriculum_data:
            instance = get_object_or_404(Curriculum, pk=uuid.UUID(item['id']))
            serializer = CurriculumSerializer(instance=instance, data=item)
            serializer.is_valid(raise_exception=True)
            serializer.save()


class PPCService:
    @staticmethod
    @transaction.atomic
    def create(ppc_data):
        curriculum_data = ppc_data.pop('curriculum', [])

        ppc_serializer = PPCSerializer(data=ppc_data)
        ppc_serializer.is_valid(raise_exception=True)
        ppc_serializer.save()

        CurriculumService.bulk_create(ppc_serializer.instance.id, curriculum_data)

        return ppc_serializer.data

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
        ppc_serializer = PPCSerializer(instance=ppc, data=ppc_data)
        ppc_serializer.is_valid(raise_exception=True)
        ppc_serializer.save()

        CurriculumService.bulk_update(curriculum_data)

        return ppc_serializer.data
