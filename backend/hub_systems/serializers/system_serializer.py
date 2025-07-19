from rest_framework import serializers
from hub_systems.models.system import System
from hub_users.models import CustomUser
from django.contrib.auth.models import Group

class SystemSerializer(serializers.ModelSerializer):
    dev_team = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CustomUser.objects.filter(access_profile='aluno', is_active=True)
    )
    groups = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Group.objects.all()
    )

    class Meta:
        model = System
        fields = ['id','name', 'system_url', 'is_active', 'current_state', 'secret_key', 'dev_team', 'groups']

    