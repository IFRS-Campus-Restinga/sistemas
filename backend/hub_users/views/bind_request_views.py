import logging
from datetime import datetime

from django.http import Http404
from fs_auth_middleware.decorators import has_permissions
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from hub_users.serializers.personal_account_infos_serializer import (
    AccessDeniedException,
)
from hub_users.services.bind_request_service import BindRequestService

logger = logging.getLogger(__name__)


@api_view(["GET"])
@has_permissions([])
def list_bind_requests(request):
    try:
        return BindRequestService.list(request)
    except AccessDeniedException:
        return Response(
            {"message": "Ocorreu um erro"}, status=status.HTTP_403_FORBIDDEN
        )
    except Exception:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(
            f"[{timestamp}] Erro inesperado ao listar solicitações de vínculo",
            exc_info=True,
        )
        return Response(
            {"message": "Ocorreu um erro"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@has_permissions([])
def count_bind_requests(request):
    try:
        count = BindRequestService.count(request)
        return Response({"count": count}, status=status.HTTP_200_OK)
    except AccessDeniedException:
        return Response(
            {"message": "Ocorreu um erro"}, status=status.HTTP_403_FORBIDDEN
        )
    except Exception:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(
            f"[{timestamp}] Erro inesperado ao contar solicitações de vínculo",
            exc_info=True,
        )
        return Response(
            {"message": "Ocorreu um erro"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@has_permissions([])
def check_pending_bind_request(request):
    try:
        pending = BindRequestService.pending(request)
        return Response({"pending": pending}, status=status.HTTP_200_OK)
    except AccessDeniedException:
        return Response(
            {"message": "Ocorreu um erro"}, status=status.HTTP_403_FORBIDDEN
        )
    except Exception:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(
            f"[{timestamp}] Erro inesperado ao consultar solicitação de vínculo pendente",
            exc_info=True,
        )
        return Response(
            {"message": "Ocorreu um erro"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PUT"])
@has_permissions([])
def approve_bind_request(request, request_id):
    try:
        BindRequestService.approve(request, request_id)
        return Response(
            {"message": "Vínculo aprovado com sucesso"},
            status=status.HTTP_200_OK,
        )
    except AccessDeniedException:
        return Response(
            {"message": "Ocorreu um erro"}, status=status.HTTP_403_FORBIDDEN
        )
    except Http404:
        return Response(
            {"message": "Ocorreu um erro"},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(
            f"[{timestamp}] Erro inesperado ao aprovar solicitação de vínculo {request_id}",
            exc_info=True,
        )
        return Response(
            {"message": "Ocorreu um erro"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["DELETE"])
@has_permissions([])
def reject_bind_request(request, request_id):
    try:
        BindRequestService.reject(request, request_id)
        return Response(
            {"message": "Solicitação de vínculo rejeitada com sucesso"},
            status=status.HTTP_200_OK,
        )
    except AccessDeniedException:
        return Response(
            {"message": "Ocorreu um erro"}, status=status.HTTP_403_FORBIDDEN
        )
    except Http404:
        return Response(
            {"message": "Ocorreu um erro"},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(
            f"[{timestamp}] Erro inesperado ao rejeitar solicitação de vínculo {request_id}",
            exc_info=True,
        )
        return Response(
            {"message": "Ocorreu um erro"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
