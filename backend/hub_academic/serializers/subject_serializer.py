from rest_framework import serializers
from ..models.subject import Subject
from ..formatters.format_subject_data import FormatSubjectData

class SubjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Subject
        fields = '__all__'

    def to_representation(self, instance):
        request = self.context.get('request', None)
        data_format = request.GET.get('data_format', None)

        if not data_format:
            raise serializers.ValidationError('O parâmetro data_format é obrigatório')
        
        match data_format:
            case 'list':
                return FormatSubjectData.list_format(instance)
            case 'details':
                return FormatSubjectData.details_format(instance)
            case 'search':
                return FormatSubjectData.search_format(instance)
            case _:
                raise serializers.ValidationError('data_format inválido')