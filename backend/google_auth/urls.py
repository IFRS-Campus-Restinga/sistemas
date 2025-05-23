from django.urls import path
from google_auth.views.login_sistema import *
from google_auth.views.login_django_admin import *

urlpatterns = [
    path('login/', login),
    path('login/google/', login_with_google),
    path('convidado/createAccount/', create_account_visitor),
    path('login-admin/', admin_login),
    path('google-callback/', google_callback, name='google_callback'),
]
