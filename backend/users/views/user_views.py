import jwt
from jwt.exceptions import ExpiredSignatureError
import uuid
from fs_auth_middleware.decorators import has_any_permission
from django.shortcuts import get_object_or_404
from django.http import Http404
from rest_framework import status, serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.pagination import PageNumberPagination
from users.models import CustomUser
from users.services.user_service import UserService
from users.serializers.custom_user_serializer import CustomUserSerializer
from django.conf import settings

@api_view(['GET'])
def get_user_data(request):
    try:
        token = request.COOKIES.get('access_token', None)

        if not token:
            return Response({'message': 'Necessário autenticar'}, status=status.HTTP_401_UNAUTHORIZED)
        
        payload= jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
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
@has_any_permission(['view_customuser'])
def list_users_by_group(request, group_name):
    try:
        search_param = request.GET.get('search')

        if search_param:
            users = CustomUser.objects.get_by_group_and_param(group_name, search_param)
        else:
            users = CustomUser.objects.get_by_group(group_name)

        if not users:
            return Response([], status=status.HTTP_200_OK)

        paginator = PageNumberPagination()
        paginator.page_size = 10
        result_page = paginator.paginate_queryset(users, request)

        serializer = CustomUserSerializer(result_page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
