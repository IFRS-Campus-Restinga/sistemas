from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status, serializers
from django.shortcuts import get_object_or_404
from django.http import Http404
from django.contrib.auth.models import Group
from rest_framework_simplejwt.tokens import RefreshToken
from google_auth.models import *
from google_auth.serializers.custom_user_serializer import Custom_User_Serializer
from google_auth.serializers.password_serializer import Password_Serializer
from django.conf import settings

GOOGLE_CLIENT_ID = settings.GOOGLE_OAUTH2_CLIENT_ID

from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
@permission_classes([AllowAny])
def login_with_google(request):
    token = request.data.get('credential', None)
    group_name = request.data.get('group', None)

    if not token:
        return Response({'message': 'Token necessário'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)

        email = idinfo.get("email")
        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")

        user, created = CustomUser.objects.get_or_create(email=email, defaults={
            "first_name": first_name,
            "last_name": last_name
        })

        if user:
            password = Password.objects.filter(user=user).first()
            if not user.is_active:
                return Response({'message':'Você não possui permissão para fazer login, contate o administrador, para ter sua conta ativada'}, status=status.HTTP_401_UNAUTHORIZED)
            
            if password:
                return Response({'message':'Método de login não disponível para esse endereço de email'}, status=status.HTTP_400_BAD_REQUEST)

        if created:
            group = Group.objects.get(name=group_name)
            permission = ''
            if group_name == 'Aluno' or group_name == 'Servidor':
                permission = Permission.objects.get(name='Membro')
            else:
                permission = Permission.objects.get(name='Convidado')


            user.permissions.add(permission)
            user.is_active = False
            user.group = group
            user.save()

            return Response({'first_login': True}, status=status.HTTP_201_CREATED)

        # Gera token com dados personalizados
        refresh = RefreshToken.for_user(user)
        refresh['first_name'] = user.first_name
        refresh['last_name'] = user.last_name
        refresh['group'] = user.group.name
        refresh['permissions'] = [perm.name for perm in user.permissions.all()]

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    try:
        user = get_object_or_404(CustomUser, email=request.data.get('email', None))

        password = Password.objects.get(user=user)

        if not password.check_password(request.data.get('password', None)):
            return Response({'message': 'Usuário ou senha incorretos'}, status=status.HTTP_400_BAD_REQUEST)
        
        refresh = RefreshToken.for_user(user)
        refresh['first_name'] = user.first_name
        refresh['last_name'] = user.last_name
        refresh['group'] = user.group.name
        refresh['permissions'] = [perm.name for perm in user.permissions.all()]

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)

    except Http404 as e:
        return Response({'message': 'Usuário não existe'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def create_account_visitor(request):
    try:
        data = request.data
        password = data.pop('password')

        user = CustomUser.objects.get(email=data.get('email', None))

        if user:
            return Response({'message': 'Email já cadastrado!'}, status=status.HTTP_400_BAD_REQUEST)

        group = Group.objects.get(name=data.get('group', None))
        permission = Permission.objects.get(name='Convidado')

        if not group:
            return Response({'Grupo de acesso inválido'}, status=status.HTTP_400_BAD_REQUEST)

        data['group'] = group.id
        data['permissions'] = [permission.id]

        serializer_user = Custom_User_Serializer(data=data)

        if not serializer_user.is_valid():
            raise serializers.ValidationError(serializer_user.errors)
        
        serializer_user.save()
        
        serializer_password = Password_Serializer(data={'user': serializer_user.instance.id, 'password': password})

        if not serializer_password.is_valid():
            raise serializers.ValidationError(serializer_password.errors)
        
        serializer_password.save()

        return Response({'message': 'Conta criada com sucesso'}, status=status.HTTP_201_CREATED)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
