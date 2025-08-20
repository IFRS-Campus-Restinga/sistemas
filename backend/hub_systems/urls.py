from django.urls import path
from hub_systems.views import *

urlpatterns = [
    path('create/', create),
    path('get/<str:system_id>/', get),
    path('validate/<str:system_id>/', validate),
    path('menu/', menu_list),
    path('edit/<str:system_id>/', edit),
]
