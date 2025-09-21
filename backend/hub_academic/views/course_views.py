import logging
from datetime import datetime
from django.http import Http404
from rest_framework import serializers, status
from rest_framework.decorators import api_view
from fs_auth_middleware.decorators import has_permissions
from rest_framework.response import Response
from ..services.course_service import CourseService
from ..utils.format_validation_errors import format_validation_errors
from ..serializers.course_serializer import CourseSerializer

logger = logging.getLogger(__name__)

@api_view(['POST'])
@has_permissions(['add_course', 'add_courseclass'])
def create_course(request):
    try:
        CourseService.create(request.data)

        return Response({'message': 'Curso cadastrado com sucesso'}, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, CourseSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao cadastrar curso", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@has_permissions(['view_course', 'view_courseclass'])
def list_course(request):
    try:
        return CourseService.list(request)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, CourseSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao listar cursos", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@has_permissions(['view_course', 'view_courseclass'])
def get_course(request, course_id):
    try:
        return Response(CourseService.get(request, course_id), status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': "Curso não enccontrado"}, status=status.HTTP_404_NOT_FOUND)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, CourseSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao obter curso {course_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT', 'PATCH'])
@has_permissions(['change_course', 'change_courseclass'])
def edit_course(request, course_id):
    try:
        CourseService.edit(request.data, course_id)

        return Response({'message': 'Curso atualizado com sucesso'}, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': "Curso não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, CourseSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao editar curso {course_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)