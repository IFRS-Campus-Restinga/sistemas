import uuid
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from hub_users.serializers.custom_user_serializer import CustomUserSerializer
from .password_service import PasswordService
from hub_users.models import *
from django.contrib.auth.models import Group
from django.db import transaction
from rest_framework.pagination import PageNumberPagination
from ..models import Password

class UserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 30

class UserService:
    @staticmethod
    @transaction.atomic
    def create_user(data) -> tuple[CustomUser, bool]:
        email = data.get('email', None)
        first_name = data.get('first_name', None)
        last_name = data.get('last_name', None)
        access_profile = data.get('accessProfile') or data.get('access_profile')
        password = data.get('password', None)

        if password:
            if access_profile != 'convidado':
                raise serializers.ValidationError('Servidores e alunos podem autenticar apenas pela conta google')

        user, created = CustomUser.objects.get_or_create(email=email, defaults={
            'username': f'{first_name} {last_name}',
            'access_profile': access_profile
        })

        if access_profile == 'aluno':
            UserService.add_group(user, 'user')

        if password and created:
            PasswordService.create(user, password)

        return user, created

    @staticmethod
    def edit(request, user_id):
        data = request.data.copy()

        user = get_object_or_404(CustomUser, pk=uuid.UUID(user_id))

        data['groups'] = [Group.objects.get(uuid_map__uuid=uuid.UUID(group['id'])).id for group in request.data.get('groups', None)]

        serializer = CustomUserSerializer(instance=user, data=data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

    @staticmethod
    def get(request, user_id):
        user = get_object_or_404(CustomUser, pk=uuid.UUID(user_id))

        serializer = CustomUserSerializer(user, context={'request': request})

        return serializer.data
    
    @staticmethod
    def add_group(user: CustomUser, group_name: str) -> None:
        group = Group.objects.get(name=group_name)

        if not group:
            raise Group.DoesNotExist
        
        user.groups.add(group)
        user.save()

    @staticmethod
    def build_user_data(user: CustomUser, picture=None):
        data = {
            'id': str(user.id),
            'username': user.username,
            'groups': [group.name for group in user.groups.all()],
            'access_profile': user.access_profile,
        }

        if user.first_login:
            data['first_login'] = user.first_login

        if not user.is_abstract:
            data['is_abstract'] = user.is_abstract

        if picture:
            data['profile_picture'] = picture
    
        return data
        
    @staticmethod
    def list_by_group(request, group_name):
        search_param = request.GET.get('search')
        status = request.GET.get('status', None)
        is_active = None

        if status:
            is_active = True if status == 'Ativo' else 'Inativo'   

        if search_param:
            users = CustomUser.objects.get_by_group_and_param(group_name, search_param, is_active)
        else:
            users = CustomUser.objects.get_by_group(group_name, is_active)

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
        status = request.GET.get('status', None)
        is_active = None

        if status:
            is_active = True if status == 'Ativo' else 'Inativo'

        if search_param:
            users = CustomUser.objects.get_by_access_profile_and_param(access_profile_name, search_param, is_active)
        else:
            users = CustomUser.objects.get_by_access_profile(access_profile_name, is_active)

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
        is_abstract = request_data.get('is_abstract')

        print(group_list)

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
        user.is_abstract = is_abstract
        user.groups.set(group_ids)
        user.save()

    @staticmethod
    def decline_request(request_id):
        user = get_object_or_404(CustomUser, pk=uuid.UUID(request_id))
        if user.custom_password: 
            user_password = Password.objects.get(user=user)

            user_password.delete()
            
        user.delete()
