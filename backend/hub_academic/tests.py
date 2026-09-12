from types import SimpleNamespace
from unittest.mock import patch

from django.test import TestCase

from .services.file_service import FileService


class FileServiceTests(TestCase):
	def test_parse_subjects_uses_subject_occurrence_order(self):
		regex_config = {
			'subj_block_regex': r'Componente Curricular\s*:',
			'subj_name_regex': r'Componente Curricular\s*:\s*(.*?)\s*(?=Semestre\s*:)',
			'subj_menu_regex': r'Ementa\s*:\s*(.*?)(?=\s*Referências)',
			'period_regex': r'Semestre\s*:\s*(.*?)\s*(?=Horas relógio:)',
			'teach_workload_regex': r'Horas aulas\s*:\s*(.*?)\s*(?=Aulas na semana:)',
			'weekly_periods_regex': r'Aulas na semana\s*:\s*(.*?)\s*(?=Ementa:)',
		}
		curriculum_block = (
			'Componente Curricular: Redes Semestre: 1 '
			'Horas relógio: 10 Horas aulas: 10 Aulas na semana: 2 Ementa: Ementa 1 Referências\n\n'
			'Componente Curricular: Redes Semestre: 3 '
			'Horas relógio: 20 Horas aulas: 20 Aulas na semana: 3 Ementa: Ementa 2 Referências'
		)
		persisted_subjects = iter([
			SimpleNamespace(name='Redes', id='subject-period-1'),
			SimpleNamespace(name='Redes', id='subject-period-2'),
		])

		with patch.object(FileService, 'persist_subject', side_effect=persisted_subjects):
			result = FileService.parse_subjects(curriculum_block, regex_config)

		self.assertEqual(
			[item['subject'] for item in result],
			['subject-period-1', 'subject-period-2'],
		)
