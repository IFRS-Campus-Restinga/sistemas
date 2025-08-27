from rest_framework import serializers
from hub_systems.models import System
from hub_users.models import CustomUser
from django.contrib.auth.models import Group
from .formatter import FormatSystemData
import secrets

import secrets

class SystemSerializer(serializers.ModelSerializer):
    dev_team = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CustomUser.objects.filter(access_profile='aluno', is_active=True)
    )
    groups = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Group.objects.all()
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
        data_format = request.GET.get("data_format", None)

        if not data_format:
            raise serializers.ValidationError('O campo data_format não pode ser nulo.')
        
        match data_format:
            case 'list':
                return FormatSystemData.list_format(instance)
            case 'details':
                return FormatSystemData.details_format(instance)
