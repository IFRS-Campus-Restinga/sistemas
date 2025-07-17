from rest_framework import serializers
from calendars.models.event import Event
from calendars.formatters.format_event_data import FormatEventData

class EventSerializer(serializers.ModelSerializer):

    class Meta:
        model = Event
        fields = '__all__'

    def validate(self, attrs):
        start = attrs.get('start', None)
        end = attrs.get('end', None)

        if not start or not end:
            raise serializers.ValidationError('As datas de início e encerramento são obrigatórias')
        
        return attrs
    
    def to_representation(self, instance):
        request = self.context.get('request', None)
        data_format = request.GET.get('data_format', None)

        if not data_format:
            raise serializers.ValidationError('O parâmetro data_format é obrigatório')
        
        match data_format:
            case 'list':
                return FormatEventData.list_format(instance)
            case 'details':
                return FormatEventData.details_format(instance)
            case _:
                raise serializers.ValidationError('data_format inválido')