from django.urls import path
from hub_systems.views import *

urlpatterns = [
    path('create/', create),
    path('get/<str:system_id>/', get),
    path('get/api_key/<str:system_id>/', get_api_key),
    path('validate/<str:api_key>/', validate),
    path('menu/', menu_list),
    path('edit/<str:system_id>/', edit),
]
