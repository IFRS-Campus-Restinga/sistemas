import uuid
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from ..models.course_class import CourseClass
from ..serializers.course_class_serializer import CourseClassSerializer

class CourseClassService:
    @staticmethod
    def create(course_id, class_number):
        serializer = CourseClassSerializer(data={'course': course_id, 'number': class_number})

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

        return serializer.instance
    
    @staticmethod
    def edit(class_data):
        course_class = get_object_or_404(CourseClass, pk=uuid.UUID(class_data.get('id', None)))
        
        serializer = CourseClassSerializer(instance=course_class, data=class_data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

    @staticmethod
    def delete(class_id):
        course_class = get_object_or_404(CourseClass, pk=uuid.UUID(class_id))

        course_class.delete()

