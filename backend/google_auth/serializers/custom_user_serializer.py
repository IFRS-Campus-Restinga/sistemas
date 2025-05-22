from rest_framework import serializers
from google_auth.models import CustomUser


class Custom_User_Serializer(serializers.Serializer):

    class Meta:
        model = CustomUser
        fields = '__all__'

    