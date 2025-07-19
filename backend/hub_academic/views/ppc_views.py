from rest_framework import serializers
from rest_framework.decorators import api_view
from fs_auth_middleware.decorators import has_every_permission

@api_view(['POST'])
@has_every_permission(['add_ppc'])
def create_ppc(request):
    pass

@api_view(['GET'])
@has_every_permission(['view_ppc', 'view_subject', 'view_course'])
def list_ppc(request):
    pass

@api_view(['GET'])
@has_every_permission(['view_ppc', 'view_subject', 'view_course'])
def get_ppc(request):
    pass

@api_view(['PUT', 'PATCH'])
@has_every_permission(['change_ppc'])
def edit_ppc(request):
    pass