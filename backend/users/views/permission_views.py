from django.http import Http404
from rest_framework import status
from rest_framework.decorators import api_view
from fs_auth_middleware.decorators import has_every_permission
from rest_framework.response import Response
from users.services.permission_service import PermissionService

@api_view(['GET'])
@has_every_permission(['view_group', 'view_permission'])
def get_not_assigned_permissions(request, group_id):
    try:
        permissions = PermissionService.get_not_assigned_to_group(group_id, request)

        return Response(permissions, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)