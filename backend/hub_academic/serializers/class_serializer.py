from rest_framework import serializers
from ..models.class_model import CourseClass

class ClassSerializer(serializers.ModelSerializer):

    class Meta:
        model = CourseClass
        fields = '__all__'