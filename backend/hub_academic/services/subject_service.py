import uuid
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from ..models.subject import Subject
from ..models.ppc import Curriculum
from ..serializers.subject_serializer import SubjectSerializer
from rest_framework.pagination import PageNumberPagination

class SubjectPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 30

class SubjectService:
    @staticmethod
    def create(course_data):
        serializer = SubjectSerializer(data=course_data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

    @staticmethod
    def get(request, subject_id):
        subject = get_object_or_404(Subject, pk=uuid.UUID(subject_id))

        serializer = SubjectSerializer(instance=subject, context={'request': request})

        return serializer.data
    
    @staticmethod
    def get_by_course(request, course_id):
        subjects = Curriculum.objects.filter(
            ppc__course=uuid.UUID(course_id),
            subject__name__icontains=request.GET.get('search', '')
        )

        serializer = SubjectSerializer(subjects, many=True, context={'request', request})

        return serializer.data

    @staticmethod
    def list(request):
        subjects = Subject.objects.filter(name__icontains=request.GET.get('search', ''))

        if not subjects.exists():
            paginator = SubjectPagination()
            paginated_result = paginator.paginate_queryset([], request)
            return paginator.get_paginated_response(paginated_result)
        
        paginator = SubjectPagination()
        paginated_result = paginator.paginate_queryset(subjects, request)

        serializer = SubjectSerializer(paginated_result, many=True, context={'request': request})

        return paginator.get_paginated_response(serializer.data)

    @staticmethod
    def edit(subject_data, subject_id):
        course = get_object_or_404(Subject, pk=uuid.UUID(subject_id))

        serializer = SubjectSerializer(instance=course, data=subject_data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()
