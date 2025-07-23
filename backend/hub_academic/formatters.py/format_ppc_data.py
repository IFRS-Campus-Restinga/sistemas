from ..models.ppc import PPC

class FormatPPCData:
    @staticmethod
    def list_format(ppc: PPC):
        return {
            'id': ppc.id,
            'titulo': ppc.title,
            'curso': ppc.course.name,
            'ano': ppc.created_at.year
        }
    
    @staticmethod
    def details_format(ppc: PPC):
        return {
            'id': ppc.id,
            'title': ppc.title,
            'course': {'id': ppc.course.id, 'name': ppc.course.name}
        }