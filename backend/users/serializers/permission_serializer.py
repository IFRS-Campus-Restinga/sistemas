from rest_framework import serializers
from django.contrib.auth.models import Permission
from users.utils.formatters.format_permission_data import FormatPermissionData

class PermissionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Permission
        fields = "__all__"

    def to_representation(self, instance):
        request = self.context.get('request')
        data_format = request.GET.get("data_format", None)

        if not data_format:
            raise serializers.ValidationError('O campo data_format não pode ser nulo.')
        
        match data_format:
            case 'list':
                return FormatPermissionData.list_format(instance)