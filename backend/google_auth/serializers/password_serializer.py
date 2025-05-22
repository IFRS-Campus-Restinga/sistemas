import re
from rest_framework import serializers
from google_auth.models import Password


class Password_Serializer(serializers.ModelSerializer):  # Use ModelSerializer ao invés de Serializer
    class Meta:
        model = Password
        fields = '__all__'

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("A senha deve ter no mínimo 8 caracteres.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("A senha deve conter ao menos uma letra maiúscula.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("A senha deve conter ao menos um número.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("A senha deve conter ao menos um caractere especial.")

        return value
