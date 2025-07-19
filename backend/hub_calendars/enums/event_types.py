from django.db.models import TextChoices

class EventTypes(TextChoices):
    SEMANA_PEDAGOGICA = 'Semana Pedagógica'
    FERIADOS_N_LETIVO = 'Feriados e dias não letivos'
    PRAZO_FIM_NOTAS_DOC = 'Prazo final para registro de notas e entrega de documentos'
    DIAS_LETIVOS = 'Dias letivos'
    RECESSO_ESC_FERIAS = 'Recesso Escolar/Férias'
    EXAMES = 'Exames'
    CONSELHOS_CLASSE = 'Conselhos de classe'
    VESTIBULAR = 'Vestibular'
    FIM_ETAPA = 'Fim de etapa'