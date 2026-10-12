from rest_framework import serializers
from hub_systems.models import System
from hub_users.models import User
from django.contrib.auth.models import Group
from .formatter import URLFieldsParser
import secrets

class SystemSerializer(serializers.ModelSerializer):
    dev_team = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.filter(access_profile='aluno', is_active=True)
    )
    api_key = serializers.CharField(required=False)

    class Meta:
        model = System
        fields = "__all__"

    def validate(self, attrs):
        if not attrs.get("dev_team"):
            raise serializers.ValidationError(
                {
                    "dev_team": (
                        "A equipe de desenvolvimento deve possuir ao menos 1 aluno."
                    )
                }
            )
        return attrs

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
