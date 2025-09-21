from rest_framework import serializers
from hub_systems.models import System
from hub_users.models import CustomUser
from django.contrib.auth.models import Group
from .formatter import URLFieldsParser
import secrets

class SystemSerializer(serializers.ModelSerializer):
    dev_team = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CustomUser.objects.filter(access_profile='aluno', is_active=True)
    )
    api_key = serializers.CharField(required=False)

    class Meta:
        model = System
        fields = "__all__"

    def create(self, validated_data):
        # gera uma chave segura de 64 caracteres hexadecimais
        validated_data['api_key'] = secrets.token_hex(32)  
        return super().create(validated_data)

    def to_representation(self, instance):
        request = self.context.get('request')
        fields = request.GET.get("fields", None)

        if not fields:
            raise serializers.ValidationError('O campo fields não pode ser nulo.')
        
        return URLFieldsParser.parse(request, instance, fields)
