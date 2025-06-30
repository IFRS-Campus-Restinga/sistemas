from django.shortcuts import get_object_or_404
from django.contrib.auth.models import Permission, Group
from users.serializers.permission_serializer import PermissionSerializer

class PermissionService:
    @staticmethod
    def get_not_assigned_to_group(group_uuid: str, request):
        group = get_object_or_404(Group, uuid_map__uuid=group_uuid)

        assigned_permissions = group.permissions.all()

        permissions = Permission.objects.exclude(id__in=assigned_permissions.values_list('id', flat=True))

        serializer = PermissionSerializer(instance=permissions, many=True, context={'request': request})

        return serializer.data
    