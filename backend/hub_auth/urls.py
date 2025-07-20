from django.urls import path
from .views.auth_views import *
from .views.token_views import *
from .views.login_django_admin import *

urlpatterns = [
    path('login/', login),
    path('login/google/', login_with_google),
    
    path('admin/login/', admin_login, name='google_login'),
    path('google-callback/', google_callback, name='google_callback'),

    path('token/refresh/', refresh_token),
    path('token/pair-token/', pair_token),
    path('logout/', logout),
]