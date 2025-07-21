import uuid
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from fs_auth_middleware.decorators import has_permissions
from rest_framework.response import Response
from rest_framework import status, serializers
from rest_framework.pagination import PageNumberPagination
from hub_systems.serializers.system_serializer import SystemSerializer
from hub_systems.models.system import System
from hub_systems.services.system_services import SystemService, SystemException

@api_view(['POST'])
@has_permissions(['add_system'])
def create_system(request):
    try:
        SystemService.create(request.data)

        return Response({'message': 'Sistema cadastrado com sucesso!'}, status=status.HTTP_201_CREATED)
    except (serializers.ValidationError, SystemException) as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
def get_system(request, system_id):
    try:
        get_object_or_404(System, pk=uuid.UUID(system_id))

        return Response({'message': "Sistema válido"}, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str (e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@has_permissions(['view_system'])
def menu_list(request):
    try:
        user_id = request.GET.get('user_id', None)
        
        systems = System.objects.list_menu(user_id)

        if not systems:
            return Response({'results': []}, status=status.HTTP_200_OK)

        paginator = PageNumberPagination()
        paginator.page_size = 10
        result_page = paginator.paginate_queryset(systems, request)

        serializer = SystemSerializer(result_page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
