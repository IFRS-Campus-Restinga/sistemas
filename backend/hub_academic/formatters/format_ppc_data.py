import uuid
from ..models.ppc import PPC, PPCSubject

class FormatPPCData:
    @staticmethod
    def get_subjects(ppc_id):
        ppc_subjects = (
            PPCSubject.objects
            .filter(ppc__id=uuid.UUID(ppc_id))
            .select_related('subject')
        )

        result = []
        for ps in ppc_subjects:
            result.append({
                'subject': ps.subject.id,
                'subject_name': ps.subject.name,
                'subject_teach_workload': ps.subject_teach_workload,
                'subject_ext_workload': ps.subject_ext_workload,
                'subject_remote_workload': ps.subject_remote_workload,
                'weekly_periods': ps.weekly_periods,
                'pre_requisits': [pre_req for pre_req in ps.pre_requisits.all()]
            })

        return result
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
            'course': {'id': ppc.course.id, 'name': ppc.course.name},
            'subjects': FormatPPCData.get_subjects(str(ppc.id))
        }