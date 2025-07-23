import uuid
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from ..models.class_model import CourseClass
from ..serializers.class_serializer import ClassSerializer

class ClassService:
    @staticmethod
    def create(course_id, class_number):
        serializer = ClassSerializer(data={'course': course_id, 'number': class_number})

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

        return serializer.instance
    
    @staticmethod
    def edit(class_data):
        course_class = get_object_or_404(CourseClass, pk=uuid.UUID(class_data.get('id', None)))
        
        serializer = ClassSerializer(instance=course_class, data=class_data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()
