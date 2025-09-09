import uuid
from hub_calendars.models.calendar import Calendar
from rest_framework import serializers
from hub_calendars.models.event import Event
from hub_calendars.formatters.format_event_data import URLFieldsParser

class EventSerializer(serializers.ModelSerializer):

    class Meta:
        model = Event
        fields = '__all__'

    def validate(self, attrs):
        start = attrs.get('start', None)
        end = attrs.get('end', None)
        calendar = attrs.get('calendar', None)

        if not start or not end:
            raise serializers.ValidationError('As datas de início e encerramento são obrigatórias')
        
        if end < start:
            raise serializers.ValidationError("Data de encerramento não pode ser inferior a de início")
        
        if start < calendar.start or start > calendar.end or end < calendar.start or end > calendar.end:
            raise serializers.ValidationError("Datas do evento estão fora do intervalo do calendário")
        
        return attrs
    
    def to_representation(self, instance):
        request = self.context.get('request', None)
        fields = request.GET.get('fields', None)

        if not fields:
            raise serializers.ValidationError('O parâmetro fields é obrigatório')
        
        return URLFieldsParser.parse(instance, fields)