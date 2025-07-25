from rest_framework import serializers
from ..models.ppc import PPC, PPCSubject
from ..formatters.format_ppc_data import FormatPPCData

class PPCSerializer(serializers.ModelSerializer):

    class Meta:
        model = PPC
        fields = '__all__'

    def to_representation(self, instance):
        request = self.context.get('request', None)
        data_format = request.GET.get('data_format', None)

        if not data_format:
            raise serializers.ValidationError('O parâmetro data_format é obrigatório')
        
        match data_format:
            case 'list':
                return FormatPPCData.list_format(instance)
            case 'details':
                return FormatPPCData.details_format(instance)
            case _:
                raise serializers.ValidationError('data_format inválido')

class PPCSubjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = PPCSubject
        fields = '__all__'