from rest_framework import serializers
from ..models.subject import Subject

class FormatSubjectData:
    @staticmethod
    def list_format(subject: Subject):
        return {
            'id': subject.id,
            'nome': subject.name
        }
    
    @staticmethod
    def search_format(subject: Subject):
        return {
            'id': subject.id,
            'title': subject.name,
            'extraField': subject.shortname
        }
    
    @staticmethod
    def details_format(subject: Subject):
        return {
            'id': subject.id,
            'name': subject.name,
            'objective': subject.objective,
            'menu': subject.menu,
            'shortname': subject.shortname
        }