import uuid
from ..models.ppc import PPC, Curriculum
from collections import defaultdict

class FormatPPCData:
    @staticmethod
    def get_curriculum_data(ppc_id):
        ppc_subjects = (
            Curriculum.objects
            .filter(ppc__id=uuid.UUID(ppc_id))
            .select_related('subject')
        )

        result = []
        for ps in ppc_subjects:
            result.append({
                'id': ps.id,
                'subject': ps.subject.id,
                'subject_teach_workload': ps.subject_teach_workload,
                'subject_ext_workload': ps.subject_ext_workload,
                'subject_remote_workload': ps.subject_remote_workload,
                'period': ps.period,
                'weekly_periods': ps.weekly_periods,
                'pre_requisits': [{'subject': pre_req.id} for pre_req in ps.pre_requisits.all()]
            })

        return result
    
    @staticmethod
    def get_curriculum(ppc_id):
        ppc_subjects = (
            Curriculum.objects
            .filter(ppc__id=uuid.UUID(ppc_id))
            .select_related('subject')
            .prefetch_related('pre_requisits')
        )

        curriculum_by_period = defaultdict(list)

        for ps in ppc_subjects:
            curriculum_by_period[ps.period].append({
                'name': ps.subject.name,
                'preRequisits': [pr.shortname for pr in ps.pre_requisits.all()]
            })

        result = []
        for period, subjects in sorted(curriculum_by_period.items()):
            result.append({
                'period': f'{period}º Período',
                'subjects': subjects
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
    def edit_details(ppc: PPC):
        return {
            'course': ppc.course.name,
            'curriculum': FormatPPCData.get_curriculum(str(ppc.id)),
            'ppc': {
                'id': ppc.id,
                'title': ppc.title,
                'course': ppc.course.id,
                'curriculum': FormatPPCData.get_curriculum_data(str(ppc.id))
            },
        }
    
    @staticmethod
    def view_details(ppc: PPC):
        return {
            'id': ppc.id,
            'title': ppc.title,
            'course': ppc.course.name,
        }