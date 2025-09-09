from uuid import UUID
from rest_framework import serializers
from ..models.ppc import PPC, Curriculum
from ..formatters.format_ppc_data import URLFieldsParser
from ..models.subject import Subject
from ..models.course import Course

class CurriculumSerializer(serializers.ModelSerializer):
    ppc = serializers.PrimaryKeyRelatedField(queryset=PPC.objects.all(), required=False)
    period = serializers.IntegerField()
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all(), required=False)
    pre_requisits = serializers.ListField(required=False)
    subject_teach_workload = serializers.IntegerField()
    subject_ext_workload = serializers.IntegerField()
    subject_remote_workload = serializers.IntegerField()
    weekly_periods = serializers.IntegerField() 

    class Meta:
        model = Curriculum
        fields = '__all__'

    def to_internal_value(self, data):
        # Normaliza pre_requisits para lista de UUIDs strings
        pre_reqs = data.get('pre_requisits', [])

        normalized = []
        for item in pre_reqs:
            if isinstance(item, dict):
                # extrai o UUID dentro do dict
                pre_req_id = item.get('subject')
                if pre_req_id:
                    normalized.append(pre_req_id)
            elif isinstance(item, str):
                normalized.append(item)
            else:
                # ignora ou lança erro
                pass

        data['pre_requisits'] = normalized
        return super().to_internal_value(data)


class PPCSerializer(serializers.ModelSerializer):
    title = serializers.CharField()
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), required=False)
    curriculum = CurriculumSerializer(many=True, write_only=True)

    class Meta:
        model = PPC
        fields = ['id', 'course', 'title', 'curriculum']

    def create(self, validated_data):
        curriculum_data = validated_data.pop('curriculum')
        course = validated_data.pop('course')

        # Busca o course real a partir do UUID recebido
        ppc = PPC.objects.create(course=course, **validated_data)

        for item in curriculum_data:
            subject = item.pop('subject')
            pre_req_ids = item.pop('pre_requisits', [])

            curriculum = Curriculum.objects.create(
                ppc=ppc,
                subject=subject,
                **item
            )

            # Relaciona os pré-requisitos
            if pre_req_ids:
                curriculum.pre_requisits.set(
                    Subject.objects.filter(id__in=pre_req_ids)
                )

        return ppc
    
    def update(self, instance, validated_data):
        curriculum_data = validated_data.pop('curriculum', [])
        course_id = validated_data.pop('course', None)

        if course_id:
            instance.course = Course.objects.get(id=course_id)
        instance.title = validated_data.get('title', instance.title)
        instance.save()

        instance.curriculum.all().delete()

        def normalize_pre_requisits(pre_requisits_raw):
            normalized = []
            for pr in pre_requisits_raw:
                if isinstance(pr, dict):
                    pre_req_id = pr.get('subject')
                else:
                    pre_req_id = pr
                if pre_req_id:
                    normalized.append(pre_req_id)
            return normalized

        for item in curriculum_data:
            subject_id = item.get('subject')
            pre_req_ids = normalize_pre_requisits(item.get('pre_requisits', []))
            other_fields = item.copy()
            other_fields.pop('subject', None)
            other_fields.pop('pre_requisits', None)

            subject = Subject.objects.get(id=subject_id)

            curriculum = Curriculum.objects.create(
                ppc=instance,
                subject=subject,
                **other_fields
            )

            if pre_req_ids:
                curriculum.pre_requisits.set(
                    Subject.objects.filter(id__in=pre_req_ids)
                )

        return instance

    def validate(self, data):
        curriculum = data.get('curriculum', [])

        # 1. Verifica se existem disciplinas no currículo
        if not curriculum:
            raise serializers.ValidationError({"Disciplina":"O currículo deve conter pelo menos uma disciplina."})

        # 2. Nenhuma disciplina do primeiro período deve ter pré-requisitos
        for item in curriculum:
            if item['period'] == 1 and item.get('pre_requisits'):
                raise serializers.ValidationError({"Pré Requisitos": "Disciplinas do 1º período não podem ter pré-requisitos."})

        # 3. Verifica se disciplinas de períodos posteriores são pré-requisitos de períodos anteriores
        period_map = {item['subject']: item['period'] for item in curriculum}
        for item in curriculum:
            current_period = item['period']
            for pre_req in item.get('pre_requisits', []):
                pre_req_period = period_map.get(pre_req)
                if pre_req_period:
                    if pre_req_period >= current_period:
                        raise serializers.ValidationError({"Pré Requisito":"Disciplinas de períodos posteriores não podem ser pré-requisitos de períodos anteriores."})

        # 4. Validação da carga horária
        total_teach = sum(item['subject_teach_workload'] for item in curriculum)
        total_ext = sum(item['subject_ext_workload'] for item in curriculum)
        total_remote = sum(item['subject_remote_workload'] for item in curriculum)

        for item in curriculum:
            for field in ['subject_teach_workload', 'subject_ext_workload', 'subject_remote_workload']:
                if field == 'subject_teach_workload' and item[field] <= 0:
                    raise serializers.ValidationError({"Carga Horária": "Os campos de carga horária de ensino devem ser maiores que zero"})

        total_curriculum_workload = total_teach + total_ext + total_remote

        # if total_curriculum_workload != course.workload:
        #     raise serializers.ValidationError({"Carga Horária":f"Soma das cargas horárias ({total_curriculum_workload}h) não corresponde à carga horária do curso ({course.workload}h)."})

        data['curriculum'] = curriculum
        return data

    def to_representation(self, instance):
        request = self.context.get('request', None)
        fields = request.GET.get('fields', None)

        if not fields:
            raise serializers.ValidationError('O parâmetro fields é obrigatório')
        
        return URLFieldsParser.parse(instance, fields)
        

            
                            


                
            
