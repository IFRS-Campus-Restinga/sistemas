import uuid
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from hub_users.serializers.user_serializer import UserSerializer
from .password_service import PasswordService
from hub_users.models import *
from hub_users.services.email_confirmation_service import EmailConfirmationService
from django.contrib.auth.models import Group
from django.db import transaction
from rest_framework.pagination import PageNumberPagination
from hub_academic.utils.query_fields import optimize_queryset
class UserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 150

class UserService:
    @staticmethod
    @transaction.atomic
    def create_user(data) -> tuple[User, bool]:
        email = data.get('email', None)
        first_name = data.get('first_name', None)
        last_name = data.get('last_name', None)
        access_profile = data.get('accessProfile') or data.get('access_profile')
        password = data.get('password', None)

        if password:
            if access_profile != 'convidado':
                raise serializers.ValidationError('Servidores e alunos podem autenticar apenas pela conta google')

        user, created = User.objects.get_or_create(email=email, defaults={
            'username': f'{first_name} {last_name}',
            'access_profile': access_profile
        })

        if created and access_profile in {'servidor', 'convidado'}:
            AccessRequest.objects.create(user=user)

        if user.access_profile == 'aluno':
            UserService.add_group(user, 'user')

        if password and created:
            PasswordService.create(user, password)

        return user, created

    @staticmethod
    @transaction.atomic
    def create_visitor_account(data) -> User:
        email = data.get('email', None)
        first_name = data.get('first_name', None)
        last_name = data.get('last_name', None)
        password = data.get('password', None)

        if not email:
            raise serializers.ValidationError({'email': 'O email deve ser fornecido.'})

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({'email': 'Este email já está cadastrado no sistema.'})

        if not password:
            raise serializers.ValidationError({'password': 'A senha deve ser fornecida.'})

        user = User.objects.create_user(
            email=email,
            username=f'{first_name} {last_name}',
            access_profile='convidado',
            email_verified=False,
        )
        PasswordService.create(user, password)
        AccessRequest.objects.create(user=user)
        EmailConfirmationService.create(user)

        return user

    @staticmethod
    def edit(request, user_id):
        data = request.data.copy()

        user = get_object_or_404(User, pk=uuid.UUID(user_id))

        data['groups'] = [Group.objects.get(uuid_map__uuid=uuid.UUID(group['id'])).id for group in request.data.get('groups', None)]

        serializer = UserSerializer(instance=user, data=data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

    @staticmethod
    def get(request, user_id):
        users = optimize_queryset(User.objects.filter(pk=uuid.UUID(user_id)), request.GET.get('fields', 'id'))
        user = get_object_or_404(users)

        serializer = UserSerializer(user, context={'request': request})

        return serializer.data
    
    @staticmethod
    def add_group(user: User, group_name: str) -> None:
        group = Group.objects.get(name=group_name)

        if not group:
            raise Group.DoesNotExist
        
        user.groups.add(group)
        user.save()

    @staticmethod
    def build_user_data(user: User, picture=None):
        data = {
            'id': str(user.id),
            'username': user.username,
            'groups': [group.name for group in user.groups.all()],
            'permissions': User.objects.get_permissions(str(user.id)),
            'access_profile': user.access_profile,
            'is_abstract': user.is_abstract,
            'personal_infos': str(user.personal_infos_id) if user.personal_infos_id else None,
            'account_infos': str(user.account_infos_id) if user.account_infos_id else None,
        }

        if user.first_login:
            data['first_login'] = user.first_login

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
            users = User.objects.get_by_group_and_param(group_name, search_param, is_active)
        else:
            users = User.objects.get_by_group(group_name, is_active)

        users = optimize_queryset(users, request.GET.get('fields', 'id'))

        if not users.exists():
            paginator = UserPagination()
            paginated_result = paginator.paginate_queryset([], request)
            return paginator.get_paginated_response(paginated_result)
        
        paginator = UserPagination()
        paginated_result = paginator.paginate_queryset(users, request)

        serializer = UserSerializer(paginated_result, many=True, context={'request': request})

        return paginator.get_paginated_response(serializer.data)
    @staticmethod
    def list_by_access_profile(request, access_profile_name):
        search_param = request.GET.get('search')
        status = request.GET.get('status', None)
        is_active = None

        if status:
            is_active = True if status == 'Ativo' else 'Inativo'

        if search_param:
            users = User.objects.get_by_access_profile_and_param(access_profile_name, search_param, is_active)
        else:
            users = User.objects.get_by_access_profile(access_profile_name, is_active)

        users = optimize_queryset(users, request.GET.get('fields', 'id'))

        if not users.exists():
            paginator = UserPagination()
            paginated_result = paginator.paginate_queryset([], request)
            return paginator.get_paginated_response(paginated_result)
        
        paginator = UserPagination()
        paginated_result = paginator.paginate_queryset(users, request)

        serializer = UserSerializer(paginated_result, many=True, context={'request': request})

        return paginator.get_paginated_response(serializer.data)
