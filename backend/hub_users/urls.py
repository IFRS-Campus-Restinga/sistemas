from django.urls import path
from hub_users.views.user_views import *

urlpatterns = [
    # user/
    path('create/', create_account_visitor),
    path('data/', get_user_data),
    path('get/group/<str:group_name>/', list_users_by_group),
    path('get/access_profile/<str:access_profile_name>/', list_users_by_access_profile),
    path('request/get/', list_user_requests),
    path('request/<str:request_id>/approve/', approve_user_request),
    path('request/<str:request_id>/decline/', decline_user_request),
]
