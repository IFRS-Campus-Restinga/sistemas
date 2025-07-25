from django.db.models import TextChoices

class CourseCategory(TextChoices):
    TEC_SUB_EM = 'Técnico Subsequente ao Ensino Médio'
    TEC_EMI = 'Técnico Integrado ao Ensino Médio'
    TEC_ProEJA = 'Educação de Jovens e Adultos (ProEJA)'
    ESPEC = 'Especialização'
    SUP = 'Superior'