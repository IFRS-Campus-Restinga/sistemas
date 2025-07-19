from django.urls import path
from .views import *

urlpatterns = [
    path('get/', list_permissions),
    path('get/<str:group_id>/not_assigned/', get_not_assigned_permissions),
    path('get/<str:group_id>/', list_by_group),
]



