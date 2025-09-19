from django.urls import path
from hub_users.views.user_views import *
from hub_users.views.additional_infos_views import *

urlpatterns = [
    # users/
    path('create/', create_account_visitor),
    path('get/data/', get_data),
    path('get/<str:user_id>/', get_user),
    path('get/group/<str:group_name>/', list_users_by_group),
    path('get/access_profile/<str:access_profile_name>/', list_users_by_access_profile),
    path('edit/<str:user_id>/', edit_user),

    # users access requests
    path('request/get/', list_user_requests),
    path('request/<str:user_id>/approve/', approve_user_request),
    path('request/<str:user_id>/decline/', decline_user_request),

    # users additional infos
    path('additional_infos/create/', create_additional_infos),
    path('additional_infos/get/<str:user_id>/', get_additional_infos),
    path('additional_infos/edit/<str:user_id>/', edit_additional_infos),
]
