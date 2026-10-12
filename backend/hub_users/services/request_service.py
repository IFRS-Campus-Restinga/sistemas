import uuid

from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import Group
from rest_framework import serializers
from rest_framework.pagination import PageNumberPagination

from hub_academic.utils.query_fields import optimize_queryset
from hub_users.models import AccessRequest, User
from hub_users.serializers.user_serializer import UserSerializer


class RequestPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 150


class AccessRequestService:
    @staticmethod
    def list(request):
        users = User.objects.filter(
            access_request__isnull=False
        ).annotate(
            access_request_id=F("access_request__id")
        ).order_by("pk")
        users = optimize_queryset(users, request.GET.get("fields", "id"))

        paginator = RequestPagination()
        page = paginator.paginate_queryset(users, request)
        serializer = UserSerializer(
            page, many=True, context={"request": request}
        )
        results = list(serializer.data)
        for user, result in zip(page, results):
            result["user_id"] = str(user.pk)
            result["id"] = str(user.access_request_id)

        return paginator.get_paginated_response(results)

    @staticmethod
    @transaction.atomic
    def approve(request_data, request_id):
        group_list = request_data.get("groups")
        if not request_id or not group_list:
            raise ValueError("ID da solicitação e lista de grupos são obrigatórios.")

        access_request = get_object_or_404(
            AccessRequest.objects.select_related("user"),
            pk=uuid.UUID(request_id),
        )
        user = access_request.user

        if user.access_profile == "convidado" and not user.email_verified:
            raise serializers.ValidationError(
                "O email do convidado precisa ser confirmado antes da aprovação."
            )

        group_ids = []
        group_names = []
        for group in group_list:
            group_uuid = uuid.UUID(group.get("id"))
            group_obj = get_object_or_404(Group, uuid_map__uuid=group_uuid)
            group_ids.append(group_obj.id)
            group_names.append(group_obj.name)

        if not group_ids:
            raise ValueError("Nenhum grupo válido foi fornecido.")

        if user.access_profile == "convidado" and "coord" in group_names:
            raise serializers.ValidationError(
                "Usuários com perfil 'convidado' não podem ter o grupo 'coord'."
            )

        user.is_active = True
        user.is_abstract = (
            False if user.access_profile == "convidado"
            else request_data.get("is_abstract")
        )
        user.groups.set(group_ids)
        user.save(update_fields=["is_active", "is_abstract"])
        access_request.delete()

    @staticmethod
    @transaction.atomic
    def reject(request_id):
        access_request = get_object_or_404(
            AccessRequest.objects.select_related("user"),
            pk=uuid.UUID(request_id),
        )
        user = access_request.user
        access_request.delete()
        user.delete()
