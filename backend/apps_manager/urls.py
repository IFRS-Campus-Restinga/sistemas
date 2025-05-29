from django.urls import path
from apps_manager.views.app_views import *

urlpatterns = [
    path('create_app/', create_app)
]
