from rest_framework import serializers
from ..models.subject import Subject

class FormatSubjectData:
    @staticmethod
    def list_format(subject: Subject):
        return {
            'id': subject.id,
            'nome': subject.name,
            'código': subject.code
        }
    
    @staticmethod
    def search_format(subject: Subject):
        return {
            'id': subject.id,
            'title': f'{subject.name} ({subject.created_at.year})',
            'extraField': subject.code
        }
    
    @staticmethod
    def details_format(subject: Subject):
        return {
            'id': subject.id,
            'name': subject.name,
            'objective': subject.objective,
            'menu': subject.menu,
            'code': subject.code
        }