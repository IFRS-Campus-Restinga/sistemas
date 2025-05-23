from rest_framework import serializers
from google_auth.models import CustomUser


class Custom_User_Serializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = '__all__'
        extra_kwargs = {
            'permissions': {'required': False}
        }

    