from rest_framework import serializers
from rest_framework.decorators import api_view
from fs_auth_middleware.decorators import has_every_permission

@api_view(['POST'])
@has_every_permission(['add_subject'])
def create_subject(request):
    pass

@api_view(['GET'])
@has_every_permission(['view_subject'])
def list_subject(request):
    pass

@api_view(['GET'])
@has_every_permission(['view_subject'])
def get_subject(request):
    pass

@api_view(['PUT', 'PATCH'])
@has_every_permission(['change_subject'])
def edit_subject(request):
    pass