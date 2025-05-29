from django.urls import path
from google_auth.views.login_sistema import *
from google_auth.views.login_django_admin import *
from google_auth.views.token_views import *

urlpatterns = [
    path('account/login/', login),
    path('login/google/', login_with_google),
    path('convidado/createAccount/', create_account_visitor),
    path('token/validate/', validate_token),
    path('login/', admin_login, name='google_login'),
    path('google-callback/', google_callback, name='google_callback'),
]
