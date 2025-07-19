from django.urls import path
from hub_users.views.auth_views import *
from hub_users.views.login_django_admin import *
from hub_users.views.token_views import *
from hub_users.views.user_views import *

urlpatterns = [
    path('login/', login),
    path('account/create/', create_account_visitor),
    path('login/google/', login_with_google),
    
    path('admin/login/', admin_login, name='google_login'),
    path('google-callback/', google_callback, name='google_callback'),

    path('token/refresh/', refresh_token),
    path('token/pair-token/', pair_token),
    path('logout/', logout),

    # user/
    path('data/', get_user_data),
    path('get/group/<str:group_name>/', list_users_by_group),
    path('get/access_profile/<str:access_profile_name>/', list_users_by_access_profile),
    path('request/get/', list_user_requests),
    path('request/<str:request_id>/approve/', approve_user_request),
    path('request/<str:request_id>/decline/', decline_user_request),
]
