from django.urls import path
from google_auth.views import login

urlpatterns = [
    path('api/token/', login),
]
