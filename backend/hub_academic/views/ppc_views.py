import logging
from datetime import datetime
from django.http import Http404
from rest_framework.response import Response
from rest_framework import serializers, status
from rest_framework.decorators import api_view
from fs_auth_middleware.decorators import has_permissions
from ..services.ppc_service import PPCService
from ..utils.format_validation_errors import format_validation_errors
from ..serializers.ppc_serializer import PPCSerializer

logger = logging.getLogger(__name__)

@api_view(['POST'])
@has_permissions(['add_ppc'])
def create_ppc(request):
    try:
        PPCService.create(request)

        return Response({'message': 'PPC cadastrado com sucesso'}, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, PPCSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao cadastrar PPC", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@has_permissions(['view_ppc', 'view_subject', 'view_course'])
def list_ppc(request):
    try:
        return PPCService.list(request)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, PPCSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao listar PPCs", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@has_permissions(['view_ppc', 'view_subject', 'view_course'])
def get_ppc(request, ppc_id):
    try:
        return Response(PPCService.get(request, ppc_id), status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, PPCSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as e:
        return Response({'message': "PPC não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao obter PPC {ppc_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT', 'PATCH'])
@has_permissions(['change_ppc'])
def edit_ppc(request, ppc_id):
    try:
        PPCService.edit(request.data, ppc_id)

        return Response({'message': 'PPC atualizado com sucesso'}, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, PPCSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as e:
        return Response({'message': "PPC não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao editar PPC {ppc_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@has_permissions(['delete_curriculum', 'change_ppc'])
def delete_period_from(_, ppc_id, period):
    try:
        PPCService.delete_period(ppc_id, period)

        return Response({'message': 'Período excluído com sucesso'}, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, PPCSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as e:
        return Response({'message': "PPC ou período não encontrados"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao excluir período {period} do PPC {ppc_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['DELETE'])
@has_permissions(['delete_curriculum', 'change_ppc'])
def delete_subject_from(_, ppc_id, subject_id):
    try:
        PPCService.delete_subject(ppc_id, subject_id)

        return Response({'message': 'Disciplina excluída com sucesso'}, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, PPCSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as e:
        return Response({'message': "PPC ou disciplina não encontrados"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao excluir disciplina {subject_id} do PPC {ppc_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['DELETE'])
@has_permissions(['delete_curriculum', 'change_ppc'])
def delete_pre_requisit_from(_, ppc_id, subject_id, pre_req_id):
    try:
        PPCService.delete_pre_requisit(ppc_id, subject_id, pre_req_id)
        return Response({'message': 'Pré requisito excluído com sucesso'}, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, PPCSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as e:
        return Response({'message': "PPC, disciplina ou pré-requisito não encontrados"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao excluir pré-requisito {pre_req_id} da disciplina {subject_id} do PPC {ppc_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)