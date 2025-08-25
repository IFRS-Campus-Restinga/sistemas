# services/ppc_service.py
import uuid
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from ..models.ppc import PPC, Curriculum
from ..models.subject import Subject
from ..serializers.ppc_serializer import PPCSerializer
from rest_framework.pagination import PageNumberPagination
from ..services.file_service import FileService


class PPCPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 30

class PPCService:
    @staticmethod
    @transaction.atomic
    def create(request):
        ppc_data = request.data.copy()

        curriculum_file = request.FILES.get("curriculum")

        curriculum_list = ppc_data.get('curriculum')

        if curriculum_file:
            curriculum_list = FileService.read_file(curriculum_file, ppc_data.get('course'))

        serializer = PPCSerializer(data={
            "title": ppc_data.get('title'),
            "course": ppc_data.get('course'),
            "curriculum": curriculum_list
        })

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()
    
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

        serializer = PPCSerializer(instance=ppc, data={**ppc_data, 'curriculum': curriculum_data})

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()
    
    @staticmethod
    def delete_period(ppc_id, period):
        ppc = get_object_or_404(PPC, pk=uuid.UUID(ppc_id))

        Curriculum.objects.filter(ppc_id=ppc.id, period=period).delete()
    
    @staticmethod
    def delete_subject(ppc_id, subject_id):
        ppc = get_object_or_404(PPC, pk=uuid.UUID(ppc_id))

        curriculum = get_object_or_404(Curriculum, ppc_id=ppc.id, subject_id=uuid.UUID(subject_id))

        curriculum.delete()

    @staticmethod
    def delete_pre_requisit(ppc_id, subject_id, pre_requisit_id):
        ppc = get_object_or_404(PPC, pk=uuid.UUID(ppc_id))

        curriculum = get_object_or_404(Curriculum, ppc_id=ppc.id, subject_id=uuid.UUID(subject_id))

        pre_requisit = get_object_or_404(Subject, id=uuid.UUID(pre_requisit_id))

        curriculum.pre_requisits.remove(pre_requisit)
