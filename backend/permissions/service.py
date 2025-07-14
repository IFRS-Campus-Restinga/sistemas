from django.shortcuts import get_object_or_404
from django.contrib.auth.models import Permission, Group
from .serializer import PermissionSerializer
from rest_framework.pagination import PageNumberPagination

class PermissionPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 30

class PermissionService:
    @staticmethod
    def list(request):
        permissions = Permission.objects.all()

        if not permissions.exists():
            paginator = PermissionPagination()
            paginated_result = paginator.paginate_queryset([], request)
            return paginator.get_paginated_response(paginated_result)
        
        paginator = PermissionPagination()
        paginated_result = paginator.paginate_queryset(permissions, request)

        serializer = PermissionSerializer(paginated_result, many=True, context={'request': request})

        return paginator.get_paginated_response(serializer.data)
        
    @staticmethod
    def get_not_assigned_to_group(request, group_uuid):
        group = get_object_or_404(Group, uuid_map__uuid=group_uuid)

        assigned_permissions = group.permissions.all()

        permissions = Permission.objects.exclude(id__in=assigned_permissions.values_list('id', flat=True))

        if not permissions.exists():
            paginator = PermissionPagination()
            paginated_result = paginator.paginate_queryset([], request)
            return paginator.get_paginated_response(paginated_result)
        
        paginator = PermissionPagination()
        paginated_result = paginator.paginate_queryset(permissions, request)
        
        serializer = PermissionSerializer(paginated_result, many=True, context={'request': request})

        return paginator.get_paginated_response(serializer.data) 
    
    @staticmethod
    def list_by_group(request, group_uuid):
        group = get_object_or_404(Group, uuid_map__uuid=group_uuid)

        permissions = group.permissions.all()

        if not permissions.exists():
            paginator = PermissionPagination()
            paginated_result = paginator.paginate_queryset([], request)
            return paginator.get_paginated_response(paginated_result)
        
        paginator = PermissionPagination()
        paginated_result = paginator.paginate_queryset(permissions, request)

        serializer = PermissionSerializer(paginated_result, many=True, context={'request': request})

        return paginator.get_paginated_response(serializer.data) 
    