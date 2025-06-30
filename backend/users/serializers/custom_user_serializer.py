import re
from rest_framework import serializers
from users.models import CustomUser
from users.utils.formatters.format_user_data import FormatUserData


class CustomUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = '__all__'

    def validate_email(self, value: str):
        email_regex = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")

        if not email_regex.match(value):
            raise serializers.ValidationError("E-mail inválido.")
        
        return value
    
    def to_representation(self, instance):
        request = self.context.get('request')
        data_format = request.GET.get("data_format", None)

        if not data_format:
            raise serializers.ValidationError('O campo data_format não pode ser nulo.')
        
        match data_format:
            case 'list':
                return FormatUserData.list_format(instance)
            case 'search':
                return FormatUserData.search_format(instance)
            case 'details':
                return FormatUserData.details_format(instance)






    