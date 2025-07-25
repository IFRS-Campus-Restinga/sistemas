import jwt
import uuid
from jwt.exceptions import ExpiredSignatureError
from fs_auth_middleware.decorators import has_permissions
from django.shortcuts import get_object_or_404
from django.http import Http404
from rest_framework import status, serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from hub_users.models import CustomUser
from hub_users.services.user_service import *
from hub_auth.services.token_service import *
from django.conf import settings

@api_view(['POST'])
def create_account_visitor(request):
    try:
        email = request.data.get('email', None)
        first_name = request.data.get('first_name', None)
        last_name = request.data.get('last_name', None)
        access_profile = request.data.get('accessProfile', None)
        password = request.data.get('password', None)

        if not email or not first_name or not last_name or not access_profile or not password:
            return Response({'message': 'Dados incompletos'}, status=status.HTTP_400_BAD_REQUEST)

        user = UserService.create_user(email, first_name, last_name, access_profile, password)

        return Response({'message': 'Conta criada com sucesso'}, status=status.HTTP_201_CREATED)
    except UserValidationException as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_user_data(request):
    try:
        token = request.COOKIES.get('access_token', None)
        system = request.COOKIES.get('system', None)
        secret = settings.SECRET_KEY

        if not token:
            return Response({'message': 'Necessário autenticar'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if system:
            secret = get_object_or_404(System, pk=uuid.UUID(system)).secret_key
        
        payload= jwt.decode(token, secret, algorithms=["HS256"])
        user_id = uuid.UUID(payload.get('user_id'))

        user = get_object_or_404(CustomUser, pk=user_id)

        user_data = UserService.build_user_data(user)

        return Response(user_data, status=status.HTTP_200_OK)
    except ExpiredSignatureError as e:
        return Response({'message': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@has_permissions(['view_customuser'])
def list_users_by_access_profile(request, access_profile_name):
    try:
        return UserService.list_by_access_profile(request, access_profile_name)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@has_permissions(['view_customuser'])
def list_users_by_group(request, group_name):
    try:
        return UserService.list_by_group(request, group_name)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@has_permissions(['view_customuser'])
def list_user_requests(request):
    try:
        return UserService.get_requests(request)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['PUT'])
@has_permissions(['change_customuser'])
def approve_user_request(request, request_id):
    try:
        UserService.approve_request(request.data, request_id)

        return Response({'message': 'Conta ativada com sucesso'}, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['DELETE'])
@has_permissions(['delete_customuser'])
def decline_user_request(request, request_id):
    try:
        UserService.decline_request(request_id)

        return Response({'message': 'Conta ativada com sucesso'}, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)