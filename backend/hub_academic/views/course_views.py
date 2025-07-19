from rest_framework import serializers
from rest_framework.decorators import api_view
from fs_auth_middleware.decorators import has_every_permission

@api_view(['POST'])
@has_every_permission(['add_course', 'add_class'])
def create_course(request):
    pass

@api_view(['GET'])
@has_every_permission(['view_course', 'view_class'])
def list_course(request):
    pass

@api_view(['GET'])
@has_every_permission(['view_course', 'view_class'])
def get_course(request):
    pass

@api_view(['PUT', 'PATCH'])
@has_every_permission(['change_course', 'change_class'])
def edit_course(request):
    pass