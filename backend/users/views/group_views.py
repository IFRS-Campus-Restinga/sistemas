from django.http import Http404
from rest_framework import serializers, status
from rest_framework.decorators import api_view
from fs_auth_middleware.decorators import has_every_permission
from rest_framework.response import Response
from users.services.group_service import GroupService
from django.contrib.auth.models import Group
from rest_framework.pagination import PageNumberPagination
from users.serializers.group_serializer import GroupSerializer


@api_view(['GET'])
@has_every_permission(['view_group'])
def list_groups(request):
    try:
        search_param = request.GET.get('search')

        if search_param:
            groups = Group.objects.filter(name__icontains=search_param)
        else:
            groups = Group.objects.all()

        if not groups:
            return Response({'results': []}, status=status.HTTP_200_OK)

        paginator = PageNumberPagination()
        paginator.page_size = 10
        result_page = paginator.paginate_queryset(groups, request)

        serializer = GroupSerializer(result_page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@has_every_permission(['view_group'])
def get_group(request, group_id):
    try:
        group = GroupService.get_group_data(group_id, request)

        return Response(group, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
