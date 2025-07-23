from rest_framework import serializers
from ..models.ppc import PPC, PPCSubject

class PPCSerializer(serializers.ModelSerializer):

    class Meta:
        model = PPC
        fields = '__all__'

class PPCSubjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = PPCSubject
        fields = '__all__'