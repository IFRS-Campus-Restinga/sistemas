from django.urls import path

from hub_users.views.user_views import (
    approve_access_request,
    decline_access_request,
    list_access_requests,
)
from hub_users.views.bind_request_views import (
    approve_bind_request,
    check_pending_bind_request,
    count_bind_requests,
    list_bind_requests,
    reject_bind_request,
)

urlpatterns = [
    path('get/', list_access_requests),
    path('bind/count/', count_bind_requests),
    path('bind/pending/', check_pending_bind_request),
    path('bind/', list_bind_requests),
    path('bind/<str:request_id>/approve/', approve_bind_request),
    path('bind/<str:request_id>/reject/', reject_bind_request),
    path('<str:request_id>/approve/', approve_access_request),
    path('<str:request_id>/decline/', decline_access_request),
]
