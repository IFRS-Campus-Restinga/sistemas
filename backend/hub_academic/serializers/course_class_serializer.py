from rest_framework import serializers
from ..models.course_class import CourseClass

class CourseClassSerializer(serializers.ModelSerializer):

    class Meta:
        model = CourseClass
        fields = '__all__'