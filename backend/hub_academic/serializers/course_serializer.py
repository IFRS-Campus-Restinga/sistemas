from rest_framework import serializers
from ..models.course import Course
from ..formatters.format_course_data import FormatCourseData

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

        data_format = request.GET.get('data_format')
        if not data_format:
            raise serializers.ValidationError('O parâmetro data_format é obrigatório.')

        match data_format:
            case 'list':
                return FormatCourseData.list_format(instance)
            case 'details':
                return FormatCourseData.details_format(instance)
            case 'search':
                return FormatCourseData.search_format(instance)
            case _:
                raise serializers.ValidationError('data_format inválido')
