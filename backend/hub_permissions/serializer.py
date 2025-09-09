from rest_framework import serializers
from django.contrib.auth.models import Permission
from .formatter import URLFieldsParser

class PermissionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Permission
        fields = "__all__"

    def to_representation(self, instance):
        request = self.context.get('request')
        fields = request.GET.get("fields", None)

        if not fields:
            raise serializers.ValidationError('O campo fields não pode ser nulo.')
        
        return URLFieldsParser.parse(instance, fields)