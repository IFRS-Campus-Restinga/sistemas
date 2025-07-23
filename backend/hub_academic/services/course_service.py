import uuid
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from ..models.course import Course
from ..serializers.course_serializer import CourseSerializer
from rest_framework.pagination import PageNumberPagination
from .class_service import ClassService

class CoursePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 30

class CourseService:
    @staticmethod
    @transaction.atomic
    def create(course_data):
        classes = course_data.pop('classes')

        serializer = CourseSerializer(data=course_data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

        [ClassService.create(serializer.instance.id, new_class).id for new_class in classes]

    @staticmethod
    def get(request, course_id):
        course = get_object_or_404(Course, pk=uuid.UUID(course_id))

        serializer = CourseSerializer(instance=course, context={'request': request})

        return serializer.data
    
    @staticmethod
    def list(request):
        courses = Course.objects.filter(name__icontains=request.GET.get('search', ''))

        if not courses.exists():
            paginator = CoursePagination()
            paginated_result = paginator.paginate_queryset([], request)
            return paginator.get_paginated_response(paginated_result)
        
        paginator = CoursePagination()
        paginated_result = paginator.paginate_queryset(courses, request)

        serializer = CourseSerializer(paginated_result, many=True, context={'request': request})

        return paginator.get_paginated_response(serializer.data)

    @staticmethod
    @transaction.atomic
    def edit(course_data, course_id):
        classes = course_data.get('classes', None)

        course = get_object_or_404(Course, pk=uuid.UUID(course_id))

        serializer = CourseSerializer(instance=course, data=course_data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

        [ClassService.edit(class_data) for class_data in classes]


