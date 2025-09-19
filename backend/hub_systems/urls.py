from django.urls import path
from hub_systems.views import *

urlpatterns = [
    # systems/
    path('create/', create_system),
    path('get/', list_systems),
    path('get/<str:system_id>/', get_system),
    path('validate/<str:api_key>/', validate_system),
    path('edit/<str:system_id>/', edit_system),
]
