from rest_framework import serializers
from ..models.course import Course
from ..formatters.format_course_data import URLFieldsParser

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

    def validate(self, attrs):
        workload = attrs.get('workload')

        if workload is not None:
            try:
                workload_int = int(workload)
                if workload_int < 0:
                    raise serializers.ValidationError({'carga horária': 'A carga horária deve ser um número inteiro positivo.'})
            except (TypeError, ValueError):
                raise serializers.ValidationError({'carga horária': 'O valor da carga horária deve ser numérico.'})

        return attrs

    def to_representation(self, instance):
        request = self.context.get('request')
        if not request:
            raise serializers.ValidationError('O request não foi fornecido no contexto do serializer.')

        fields = request.GET.get('fields')

        if not fields:
            raise serializers.ValidationError('O parâmetro fields é obrigatório.')
        
        return URLFieldsParser.parse(instance, fields)

        
