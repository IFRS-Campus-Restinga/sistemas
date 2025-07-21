from django.http import Http404
from rest_framework import serializers, status
from rest_framework.decorators import api_view
from fs_auth_middleware.decorators import has_permissions
from rest_framework.response import Response
from .service import GroupService

@api_view(['POST'])
@has_permissions(['add_group'])
def create(request):
    try:
        group = GroupService.create(request.data.get('name', None))

        GroupService.edit(request.data, str(group.uuid_map.uuid))

        return Response({'message': 'Grupo criado com sucesso'}, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@has_permissions(['view_group'])
def list_groups(request):
    try:
        return GroupService.list(request)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@has_permissions(['view_group'])
def get(request, group_id):
    try:
        group = GroupService.get_group_data(group_id, request)

        return Response(group, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT', 'PATCH'])
@has_permissions(['change_group'])
def edit(request, group_id):
    try:
        GroupService.edit(request.data, group_id)

        return Response({'message': 'Grupo atualizado com sucesso'}, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['DELETE'])
@has_permissions(['delete_group'])
def delete(request, group_id):
    pass
