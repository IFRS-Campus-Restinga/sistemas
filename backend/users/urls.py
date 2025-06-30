from django.urls import path
from users.views.auth_views import *
from users.views.login_django_admin import *
from users.views.token_views import *
from users.views.user_views import *
from users.views.group_views import *

urlpatterns = [
    path('login/', login),
    path('account/create/', create_account_visitor),
    path('login/google/', login_with_google),
    
    path('login/', admin_login, name='google_login'),
    path('google-callback/', google_callback, name='google_callback'),

    path('token/refresh/', refresh_token),
    path('token/pair-token/', pair_token),
    path('token/logout/', logout),
    path('data/', get_user_data),

    path('list/<str:group_name>/', list_users_by_group),
    path('groups/list/', list_groups),
]
