from django.urls import path
from hub_users.views.user_views import *
from hub_users.views.personal_account_infos_views import *

urlpatterns = [
    # users/
    path('create/', create_account_visitor),
    path('email-confirmation/<uuid:confirmation_id>/', confirm_email),
    path('email-confirmation/<uuid:confirmation_id>/regenerate/', regenerate_email_confirmation),
    path('get/data/', get_data),
    path('get/<str:user_id>/', get_user),
    path('get/group/<str:group_name>/', list_users_by_group),
    path('get/access_profile/<str:access_profile_name>/', list_users_by_access_profile),
    path('edit/<str:user_id>/', edit_user),

    # personal and account infos
    path('personal_account_infos/create/', create_personal_account_infos),
    path('personal_account_infos/get/<str:user_id>/', get_personal_account_infos),
    path('personal_account_infos/edit/<str:user_id>/', edit_personal_account_infos),
]
