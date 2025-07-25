from django.urls import path
from .views import *

urlpatterns = [
    path('create/', create),
    path('get/', list_groups),
    path('get/<str:group_id>/', get),
    path('edit/<str:group_id>/', edit),
    path('delete/<str:group_id>/', delete)
]
