from apps_manager.models import App
from rest_framework import serializers


class App_Serializer(serializers.Serializer):

    class Meta:
        model = App
        fields = '__all__'

    