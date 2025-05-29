from rest_framework import serializers, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps_manager.serializers.app_serializer import App_Serializer

@api_view(['POST'])
def create_app(request):
    try:
        serializer = App_Serializer(data=request.data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        return Response({'message': 'Sistema cadastrado com sucesso!'}, status=status.HTTP_201_CREATED)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
