from django.urls import path
from .views.auth_views import *
from .views.token_views import *

urlpatterns = [
    path('login/', login),
    path('login/google/', login_with_google),

    path('token/refresh/', refresh_token),
    path('token/pair-token/', pair_token),
    path('logout/', logout),
]
