from django.db.models import Q
from rest_framework import serializers
from hub_calendars.models.calendar import Calendar
from hub_calendars.formatters.format_calendar_data import URLFieldsParser

class CalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calendar
        fields = '__all__'

    def validate(self, attrs):
        start = attrs.get('start', None)
        end =  attrs.get('end', None)

        if not start or not end:
            raise serializers.ValidationError('datas de início e encerramento são obrigatórias')
        
        if end < start:
            raise serializers.ValidationError('A data de encerramento não pode ser menor que a de início')
        
        overlaping_calendars = Calendar.objects.filter(
            # verifica se as datas de inicio e fim estão dentro do intervalo de outro calendario
            Q (start__gte=start) & Q (end__lte=end) |
            # verifica se as datas de inicio e fim de outro calendário estão dentro deste intervalo
            Q (start__lte=start) & Q (end__gte=end) |
            # verifica se o calendario termina dentro de outro
            Q (end__gte=start, end__lte=end) |
            # verifica se o calendario começa dentro de outro
            Q (start__gte=start, start__lte=end)
        )

        if self.instance:
            overlaping_calendars = overlaping_calendars.exclude(pk=self.instance.pk)

        if overlaping_calendars.exists():
            raise serializers.ValidationError('Já existem calendários registrados neste intervalo')
        
        return attrs
    
    def to_representation(self, instance):
        request = self.context.get('request', None)
        fields = request.GET.get('fields', None)

        if not fields:
            raise serializers.ValidationError('O parâmetro fields é obrigatório')
        
        return URLFieldsParser.parse(instance, fields)