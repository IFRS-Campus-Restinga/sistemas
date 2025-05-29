from rest_framework import serializers
from google_auth.models import CustomUser


class CustomUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = '__all__'
        extra_kwargs = {
            'permissions': {'required': False}
        }

    