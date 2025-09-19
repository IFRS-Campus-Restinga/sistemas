import logging
from datetime import datetime
from django.http import Http404
from rest_framework import serializers, status
from rest_framework.decorators import api_view
from fs_auth_middleware.decorators import has_permissions
from rest_framework.response import Response
from ..services.course_class_service import CourseClassService

logger = logging.getLogger(__name__)

@api_view(['DELETE'])
@has_permissions(['delete_courseclass'])
def delete_course_class(request, class_id):
    try:
        CourseClassService.delete(class_id)
        return Response({'message': 'Turma excluída com sucesso'}, status=status.HTTP_200_OK)

    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao excluir turma {class_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
