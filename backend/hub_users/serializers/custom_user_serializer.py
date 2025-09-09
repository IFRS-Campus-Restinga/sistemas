import re
from rest_framework import serializers
from hub_users.models import CustomUser
from ..formatter import URLFieldsParser

class CustomUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = '__all__'

    def validate_email(self, value: str):
        email_regex = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")

        if not email_regex.match(value):
            raise serializers.ValidationError("E-mail inválido.")
        
        return value
    
    def to_representation(self, instance):
        request = self.context.get('request')
        fields = request.GET.get("fields", None)

        if not fields:
            raise serializers.ValidationError('O campo fields não pode ser nulo.')

        return URLFieldsParser.parse(instance, fields)









    