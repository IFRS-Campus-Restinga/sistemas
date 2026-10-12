import uuid

from django.conf import settings
from django.db import transaction
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination

from hub_auth.services.token_service import TokenService, TokenValidationError
from hub_users.models import BindRequest, User
from hub_users.serializers.personal_account_infos_serializer import (
    AccessDeniedException,
)


class BindRequestPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 150


class BindRequestService:
    @staticmethod
    def _get_account_user(request):
        access_token = request.COOKIES.get(settings.AUTH_COOKIE_NAME)
        if not access_token:
            raise AccessDeniedException(
                "É necessário estar autenticado para acessar essas solicitações."
            )

        try:
            payload = TokenService.decode_token(access_token)
            user_id = uuid.UUID(str(payload.get("user_id")))
        except (TokenValidationError, TypeError, ValueError, AttributeError) as error:
            raise AccessDeniedException("Usuário inválido no token.") from error

        user = User.objects.filter(pk=user_id).first()
        if not user:
            raise AccessDeniedException("Usuário inválido no token.")
        return user

    @staticmethod
    def _get_bind_request_id(request_id):
        try:
            return uuid.UUID(str(request_id))
        except (TypeError, ValueError, AttributeError) as error:
            raise Http404 from error

    @staticmethod
    def list(request):
        account_user = BindRequestService._get_account_user(request)
        requests = BindRequest.objects.none()
        if account_user.personal_infos_id:
            requests = (
                BindRequest.objects.filter(
                    personal_infos_id=account_user.personal_infos_id
                )
                .select_related("user")
                .order_by("pk")
            )

        paginator = BindRequestPagination()
        page = paginator.paginate_queryset(requests, request)
        results = [
            {
                "id": str(bind_request.pk),
                "username": bind_request.user.username,
                "email": bind_request.user.email,
                "access_profile": bind_request.user.access_profile,
            }
            for bind_request in page
        ]
        return paginator.get_paginated_response(results)

    @staticmethod
    def count(request):
        account_user = BindRequestService._get_account_user(request)
        if not account_user.personal_infos_id:
            return 0
        return BindRequest.objects.filter(
            personal_infos_id=account_user.personal_infos_id
        ).count()

    @staticmethod
    def pending(request):
        account_user = BindRequestService._get_account_user(request)
        return BindRequest.objects.filter(user=account_user).exists()

    @staticmethod
    @transaction.atomic
    def approve(request, request_id):
        account_user = BindRequestService._get_account_user(request)
        if not account_user.personal_infos_id:
            raise Http404

        bind_request = get_object_or_404(
            BindRequest.objects.select_for_update().select_related("user"),
            pk=BindRequestService._get_bind_request_id(request_id),
            personal_infos_id=account_user.personal_infos_id,
        )
        bind_request.user.personal_infos_id = bind_request.personal_infos_id
        bind_request.user.save(update_fields=["personal_infos"])
        bind_request.delete()

    @staticmethod
    @transaction.atomic
    def reject(request, request_id):
        account_user = BindRequestService._get_account_user(request)
        if not account_user.personal_infos_id:
            raise Http404

        bind_request = get_object_or_404(
            BindRequest.objects.select_for_update().select_related("user"),
            pk=BindRequestService._get_bind_request_id(request_id),
            personal_infos_id=account_user.personal_infos_id,
        )
        requesting_user = bind_request.user
        bind_request.delete()
        account_infos = requesting_user.account_infos
        requesting_user.personal_infos = None
        requesting_user.account_infos = None
        requesting_user.first_login = True
        requesting_user.save(
            update_fields=["personal_infos", "account_infos", "first_login"]
        )

        if account_infos and not account_infos.users.exists():
            account_infos.delete()
