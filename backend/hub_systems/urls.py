from django.urls import path
from hub_systems.views.system_views import *

urlpatterns = [
    path('create/', create_system),
    path('get/<str:system_id>/', get_system),
    path('menu/', menu_list),
]
