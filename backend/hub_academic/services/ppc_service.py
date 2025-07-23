import uuid
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from ..models.ppc import PPC, PPCSubject
from ..serializers.ppc_serializer import PPCSerializer, PPCSubjectSerializer
from rest_framework.pagination import PageNumberPagination

class PPCPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 30

class PPCSubjectService:
    @staticmethod
    def create(ppc_id, subject_data):
        serializer = PPCSubjectSerializer(data={'ppc': ppc_id, **subject_data})

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

    @staticmethod
    def edit(ppc_subject_data):
        ppc_subject = get_object_or_404(PPCSubject, pk=uuid.UUID(ppc_subject_data.get('id', None)))

        serializer = PPCSubjectSerializer(instance=ppc_subject, data=ppc_subject_data)

        if not serializer.is_valid():
            serializers.ValidationError(serializer.errors)

        serializer.save()


class PPCService:
    @staticmethod
    @transaction.atomic
    def create(ppc_data):
        subjects = ppc_data.pop('subjects', None)

        serializer = PPCSerializer(data=ppc_data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

        [PPCSubjectService.create(serializer.instance.id, subject_data) for subject_data in subjects]

    @staticmethod
    def get(request, ppc_id):
        ppc = get_object_or_404(PPC, pk=uuid.UUID(ppc_id))

        serializer = PPCSerializer(instance=ppc, context={'request': request})

        return serializer.data
    
    @staticmethod
    def list(request):
        ppcs = PPC.objects.filter(name__icontains=request.GET.get('search', ''))

        if not ppcs.exists():
            paginator = PPCPagination()
            paginated_result = paginator.paginate_queryset([], request)
            return paginator.get_paginated_response(paginated_result)
        
        paginator = PPCPagination()
        paginated_result = paginator.paginate_queryset(ppcs, request)

        serializer = PPCSerializer(paginated_result, many=True, context={'request': request})

        return paginator.get_paginated_response(serializer.data)

    @staticmethod
    @transaction.atomic
    def edit(ppc_data, ppc_id):
        subjects = ppc_data.pop('subjects', None)

        ppc = get_object_or_404(PPC, pk=uuid.UUID(ppc_id))

        serializer = PPCSerializer(instance=ppc, data=ppc_data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

        [PPCSubjectService.edit(subject_data) for subject_data in subjects]
