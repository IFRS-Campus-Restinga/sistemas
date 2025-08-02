from rest_framework import serializers
from ..models.ppc import PPC, Curriculum
from ..formatters.format_ppc_data import FormatPPCData
from ..models.subject import Subject
from ..models.course import Course

class CurriculumSerializer(serializers.ModelSerializer):
    ppc = serializers.PrimaryKeyRelatedField(queryset=PPC.objects.all(), required=False)
    period = serializers.IntegerField()
    subject = serializers.UUIDField()
    pre_requisits = serializers.ListField(child=serializers.UUIDField(), required=False)
    subject_teach_workload = serializers.IntegerField()
    subject_ext_workload = serializers.IntegerField()
    subject_remote_workload = serializers.IntegerField()
    weekly_periods = serializers.IntegerField()

    class Meta:
        model = Curriculum
        fields = '__all__'


class PPCSerializer(serializers.ModelSerializer):
    course = serializers.UUIDField()
    title = serializers.CharField()
    curriculum = CurriculumSerializer(many=True, write_only=True)

    class Meta:
        model = PPC
        fields = ['id', 'course', 'title', 'curriculum']

    def create(self, validated_data):
        curriculum_data = validated_data.pop('curriculum')
        course_id = validated_data.pop('course')

        # Busca o course real a partir do UUID recebido
        course = Course.objects.get(id=course_id)
        ppc = PPC.objects.create(course=course, **validated_data)

        for item in curriculum_data:
            subject_id = item.pop('subject')
            pre_req_ids = item.pop('pre_requisits', [])
            subject = Subject.objects.get(id=subject_id)

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

        # Remove currículo antigo
        instance.curriculum.all().delete()

        for item in curriculum_data:
            subject_id = item.pop('subject')
            pre_req_ids = item.pop('pre_requisits', [])
            subject = Subject.objects.get(id=subject_id)

            curriculum = Curriculum.objects.create(
                ppc=instance,
                subject=subject,
                **item
            )

            if pre_req_ids:
                curriculum.pre_requisits.set(
                    Subject.objects.filter(id__in=pre_req_ids)
                )

        return instance

    def validate(self, data):
        curriculum = data.get('curriculum', [])
        course_id = data.get('course')

        # 1. Verifica se existem disciplinas no currículo
        if not curriculum:
            raise serializers.ValidationError({"Disciplina":"O currículo deve conter pelo menos uma disciplina."})

        # 2. Nenhuma disciplina do primeiro período deve ter pré-requisitos
        for item in curriculum:
            if item['period'] == 1 and item.get('pre_requisits'):
                raise serializers.ValidationError({"Pré Requisitos": "Disciplinas do 1º período não podem ter pré-requisitos."})

        # 3. Verifica se há disciplinas repetidas
        subject_ids = [item['subject'] for item in curriculum]
        if len(subject_ids) != len(set(subject_ids)):
            raise serializers.ValidationError({"Disciplinas":"Existem disciplinas repetidas no currículo."})

        # 4. Verifica se disciplinas de períodos posteriores são pré-requisitos de períodos anteriores
        period_map = {item['subject']: item['period'] for item in curriculum}
        for item in curriculum:
            current_period = item['period']
            for pre_req in item.get('pre_requisits', []):
                pre_req_period = period_map.get(pre_req)
                if pre_req_period >= current_period:
                    raise serializers.ValidationError({"Pré Requisito":"Disciplinas de períodos posteriores não podem ser pré-requisitos de períodos anteriores."})

        # 5. Validação da carga horária
        total_teach = sum(item['subject_teach_workload'] for item in curriculum)
        total_ext = sum(item['subject_ext_workload'] for item in curriculum)
        total_remote = sum(item['subject_remote_workload'] for item in curriculum)

        for item in curriculum:
            for field in ['subject_teach_workload', 'subject_ext_workload', 'subject_remote_workload']:
                if field == 'subject_teach_workload' and item[field] <= 0:
                    raise serializers.ValidationError({"Carga Horária": "Os campos de carga horária de ensino devem ser maiores que zero"})

        total_curriculum_workload = total_teach + total_ext + total_remote

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            raise serializers.ValidationError({"Curso":"Curso vinculado não encontrado."})

        if total_curriculum_workload != course.workload:
            raise serializers.ValidationError({"Carga Horária":f"Soma das cargas horárias ({total_curriculum_workload}h) não corresponde à carga horária do curso ({course.workload}h)."})

        data['curriculum'] = curriculum
        return data

    def to_representation(self, instance):
        request = self.context.get('request', None)
        data_format = request.GET.get('data_format', None)

        if not data_format:
            raise serializers.ValidationError('O parâmetro data_format é obrigatório')
        
        match data_format:
            case 'list':
                return FormatPPCData.list_format(instance)
            case 'details':
                return FormatPPCData.details_format(instance)
            case _:
                raise serializers.ValidationError('data_format inválido')
        

            
                            


                
            
