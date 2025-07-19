from rest_framework import serializers
from django.contrib.auth.models import Group, Permission
from .formatter import FormatGroupData

class GroupSerializer(serializers.ModelSerializer):
    permissions = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Permission.objects.all(), write_only=True
    )

    class Meta:
        model = Group
        fields = '__all__'

    def to_representation(self, instance):
        request = self.context.get('request')
        data_format = request.GET.get("data_format", None)

        if not data_format:
            raise serializers.ValidationError('O campo data_format não pode ser nulo.')
        
        match data_format:
            case 'list':
                return FormatGroupData.list_format(instance)
            case 'details':
                return FormatGroupData.details_format(instance)
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.save()

        # Remove do grupo apenas as permissões recebidas
        if 'permissions' in validated_data:
            permissions_to_remove = validated_data['permissions']
            instance.permissions.remove(*permissions_to_remove)

        return instance
