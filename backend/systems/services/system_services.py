from users.services.group_service import GroupService
from systems.serializers.system_serializer import SystemSerializer
from rest_framework import serializers

class SystemException(Exception):
    pass

class SystemService:
    @staticmethod
    def create(system_data):
        groups = system_data.pop('groups', None)

        if not groups:
            raise SystemException('Todo sistema deve conter grupos')
        
        created_groups = [GroupService.create(group).id for group in groups]

        system_data['groups'] = created_groups

        serializer = SystemSerializer(data=system_data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

        return serializer.instance


