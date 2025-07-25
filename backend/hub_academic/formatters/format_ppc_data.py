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
                'subject_name': ps.subject.name,
                'subject_teach_workload': ps.subject_teach_workload,
                'subject_ext_workload': ps.subject_ext_workload,
                'subject_remote_workload': ps.subject_remote_workload,
                'real_teach_workload': ps.real_teach_workload,
                'real_ext_workload': ps.real_ext_workload,
                'real_remote_workload': ps.real_remote_workload,
                'total_workload': ps.total_workload,
                'weekly_periods': ps.weekly_periods,
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
            'subjects': PPCService.get_subjects(str(ppc.id))
        }