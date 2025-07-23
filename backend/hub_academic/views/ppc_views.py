from django.http import Http404
from rest_framework.response import Response
from rest_framework import serializers, status
from rest_framework.decorators import api_view
from fs_auth_middleware.decorators import has_permissions
from ..services.ppc_service import PPCService

@api_view(['POST'])
@has_permissions(['add_ppc'])
def create_ppc(request):
    try:
        PPCService.create(request.data)

        return Response({'message': 'PPC cadastrado com sucesso'}, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@has_permissions(['view_ppc', 'view_subject', 'view_course'])
def list_ppc(request):
    try:
        return PPCService.list(request)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@has_permissions(['view_ppc', 'view_subject', 'view_course'])
def get_ppc(request, ppc_id):
    try:
        course = PPCService.get(request, ppc_id)

        return Response(course, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT', 'PATCH'])
@has_permissions(['change_ppc'])
def edit_ppc(request, ppc_id):
    try:
        PPCService.edit(request.data, ppc_id)

        return Response({'message': 'PPC atualizado com sucesso'}, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except serializers.ValidationError as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)