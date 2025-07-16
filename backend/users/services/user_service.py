import uuid
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import serializers
from users.serializers.custom_user_serializer import CustomUserSerializer
from .password_service import PasswordService
from users.models import *
from django.contrib.auth.models import Group
from django.db import transaction
from rest_framework.pagination import PageNumberPagination

class UserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 30

class UserValidationException(Exception):
    pass

class UserService:
    @staticmethod
    @transaction.atomic
    def create_user(email: str, first_name: str, last_name: str, access_profile: str, password: str = None) -> CustomUser:
        try:
            if password:
                if access_profile != 'convidado':
                    raise UserValidationException('Servidores e alunos podem autenticar apenas pela conta google')
                
                user_serializer = CustomUserSerializer(data={'email': email, 'first_name': first_name, 'last_name': last_name})

                if not user_serializer.is_valid():
                    raise serializers.ValidationError(user_serializer.errors)

            user, created = CustomUser.objects.get_or_create(email=email, defaults={
                'first_name': first_name,
                'last_name': last_name,
                'access_profile': access_profile
            })

            if password and created:
                PasswordService.create(user, password)

            return user
        except serializers.ValidationError as e:
            raise e

    @staticmethod
    def add_group(user: CustomUser, group_name: str) -> None:
        group = Group.objects.get(name=group_name)

        if not group:
            raise Group.DoesNotExist
        
        user.groups.add(group)
        user.save()

    @staticmethod
    def build_user_data(user: CustomUser, picture=None):
        return {
            'id': user.id,
            'username': f'{user.first_name} {user.last_name}',
            'first_login': user.first_login,
            'profile_picture': picture,
            'groups': [group.name for group in user.groups.all()],
        }
    
    @staticmethod
    def list_by_group(request, group_name):
        search_param = request.GET.get('search')

        if search_param:
            users = CustomUser.objects.get_by_group_and_param(group_name, search_param)
        else:
            users = CustomUser.objects.get_by_group(group_name)

        if not users.exists():
            paginator = UserPagination()
            paginated_result = paginator.paginate_queryset([], request)
            return paginator.get_paginated_response(paginated_result)
        
        paginator = UserPagination()
        paginated_result = paginator.paginate_queryset(users, request)

        serializer = CustomUserSerializer(paginated_result, many=True, context={'request': request})

        return paginator.get_paginated_response(serializer.data)

    @staticmethod
    def list_by_access_profile(request, access_profile_name):
        search_param = request.GET.get('search')

        if search_param:
            users = CustomUser.objects.get_by_access_profile_and_param(access_profile_name, search_param)
        else:
            users = CustomUser.objects.get_by_access_profile(access_profile_name)

        if not users.exists():
            paginator = UserPagination()
            paginated_result = paginator.paginate_queryset([], request)
            return paginator.get_paginated_response(paginated_result)
        
        paginator = UserPagination()
        paginated_result = paginator.paginate_queryset(users, request)

        serializer = CustomUserSerializer(paginated_result, many=True, context={'request': request})

        return paginator.get_paginated_response(serializer.data)
    
    @staticmethod
    def get_requests(request):
        requests = CustomUser.objects.filter(first_login=True, is_active=False)

        if not requests.exists():
            paginator = UserPagination()
            paginated_result = paginator.paginate_queryset([], request)
            return paginator.get_paginated_response(paginated_result)
        
        paginator = UserPagination()
        paginated_result = paginator.paginate_queryset(requests, request)

        serializer = CustomUserSerializer(paginated_result, many=True, context={'request': request})

        return paginator.get_paginated_response(serializer.data)

    @staticmethod
    def approve_request(request_data, id):
        user_id = id
        group_list = request_data.get('groups')

        if not user_id or not group_list:
            raise ValueError("ID do usuário e lista de grupos são obrigatórios.")

        user = get_object_or_404(CustomUser, pk=uuid.UUID(user_id))

        group_ids = []
        for group in group_list:
            group_uuid = uuid.UUID(group.get('id'))
            group_obj = get_object_or_404(Group, uuid_map__uuid=group_uuid)
            group_ids.append(group_obj.id)
           

        if not group_ids:
            raise ValueError("Nenhum grupo válido foi fornecido.")

        # Atualizar o usuário
        user.is_active = True
        user.groups.set(group_ids)
        user.save()

    @staticmethod
    def decline_request(request_id):
        user = get_object_or_404(CustomUser, pk=uuid.UUID(request_id))

        user.delete()
