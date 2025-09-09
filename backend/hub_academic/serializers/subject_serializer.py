from rest_framework import serializers
from ..models.subject import Subject
from ..formatters.format_subject_data import URLFieldsParser

class SubjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Subject
        fields = '__all__'

    def to_representation(self, instance):
        request = self.context.get('request', None)
        fields = request.GET.get('fields', None)

        if not fields:
            raise serializers.ValidationError('O parâmetro fields é obrigatório')
        
        return URLFieldsParser.parse(instance, fields)