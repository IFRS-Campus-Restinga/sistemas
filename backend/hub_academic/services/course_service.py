import uuid
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from ..models.course import Course
from ..serializers.course_serializer import CourseSerializer
from rest_framework.pagination import PageNumberPagination
from .course_class_service import CourseClassService

class CoursePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 30

class CourseService:
    @staticmethod
    @transaction.atomic
    def create(course_data):
        classes = course_data.pop('classes', None)
        category = course_data.get('category', None)

        if category in ['Técnico Subsequente ao Ensino Médio', 'Técnico Integrado ao Ensino Médio']:
            if not classes:
                raise serializers.ValidationError({'turmas': 'Em modalidades relacionadas ao Ensino Médio, o curso deve possuir turmas.'})

        serializer = CourseSerializer(data=course_data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

        [CourseClassService.create(serializer.instance.id, class_data['number']) for class_data in classes]

    @staticmethod
    def get(request, course_id):
        course = get_object_or_404(Course, pk=uuid.UUID(course_id))

        serializer = CourseSerializer(instance=course, context={'request': request})

        return serializer.data
    
    @staticmethod
    def list(request):
        category = request.GET.get('category', None)

        courses = Course.objects.filter(name__icontains=request.GET.get('search', ''))

        if category:
            courses = courses.filter(category=category)

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
        classes = course_data.pop('classes', None)
        category = course_data.get('category', None)

        classes_to_create = [c for c in classes if 'id' not in c or not c['id']]
        classes_to_edit = [c for c in classes if 'id' in c and c['id']]

        if category in ['Técnico Subsequente ao Ensino Médio', 'Técnico Integrado ao Ensino Médio']:
            if not classes:
                raise serializers.ValidationError({'turmas': 'Em modalidades relacionadas ao Ensino Médio, o curso deve possuir turmas.'})

        course = get_object_or_404(Course, pk=uuid.UUID(course_id))

        serializer = CourseSerializer(instance=course, data=course_data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

        [CourseClassService.create(serializer.instance.id, class_data['number']) for class_data in classes_to_create]
        [CourseClassService.edit(class_data) for class_data in classes_to_edit]

