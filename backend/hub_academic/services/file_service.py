import re
import fitz
import uuid
import random
import logging
from typing import IO, Tuple, Optional
from ..models.course import Course
from ..models.subject import Subject
from ..models.ppc import PPC, Curriculum
from rest_framework import serializers

logger = logging.getLogger(__name__)

class FormatFileService:
    ROMAN_MAP = {
        'I': 1, 'V': 5, 'X': 10, 'L': 50,
        'C': 100, 'D': 500, 'M': 1000
    }

    @staticmethod
    def roman_to_int(roman: str) -> int:
        """
        Converte numeral romano (em letras maiúsculas) para inteiro.
        Retorna 0 se não for válido.
        """
        roman = roman.upper()
        total = 0
        prev_value = 0
        for char in reversed(roman):
            if char not in FormatFileService.ROMAN_MAP:
                return 0
            value = FormatFileService.ROMAN_MAP[char]
            if value < prev_value:
                total -= value
            else:
                total += value
                prev_value = value
        return total

    @staticmethod
    def format_str_to_number(text: str) -> str:
        """
        Retorna os números no início da string, ou o primeiro número encontrado,
        ignorando espaços e símbolos como º, ª, h, a, etc.
        Se começar com numeral romano (I, II, III...), converte para arábico.
        Retorna '0' se nenhum número for encontrado.
        """
        if not text:
            return '0'

        text = text.strip().upper()  # remove espaços e padroniza maiúsculas

        # 1. Tenta pegar dígitos no início da string
        match_digits = re.match(r'\d+', text)
        if match_digits:
            return match_digits.group(0)

        # 2. Tenta pegar números romanos no início
        match_roman = re.match(r'[IVXLCDM]+', text)
        if match_roman:
            arabic = FormatFileService.roman_to_int(match_roman.group(0))
            return str(arabic) if arabic > 0 else 0

        # 3. Caso não esteja no início, pega o **primeiro número que aparecer na string**
        nums = re.findall(r'\d+', text)
        if nums:
            return nums[0]

        # 4. Se nada for encontrado, retorna 0
        return 0

    @staticmethod
    def format_pre_requisits(text: str):
        """
        Recebe um texto bruto contendo os pré-requisitos de uma disciplina
        e retorna uma lista com os nomes das disciplinas.
        """

        print(text)

        if not text:
            return []

        # Regex para detectar ausência de pré-requisitos
        if re.fullmatch(r'\s*(nenhum|não há|nao ha|não existem|nenhuma)([.!?,;:]*)\s*',text, flags=re.I):            
            return []

        # Remove quebras de linha e múltiplos espaços
        clean_text = re.sub(r'\s+', ' ', text).strip()

        # Supondo que as disciplinas estejam separadas por vírgulas ou ponto e vírgula
        pre_requisits = re.split(r'\s*(?:,|;|\be\b)\s*', clean_text, flags=re.I)

        # Remove entradas vazias e espaços extras
        pre_requisits = [s.strip() for s in pre_requisits if s.strip()]

        return pre_requisits

    @staticmethod
    def format_subject_name(name: str) -> str:
        """
        Formata o nome da disciplina removendo prefixos numéricos do início,
        incluindo hífen ou ponto e possíveis quebras de linha ou múltiplos espaços.
        """
        # Remove prefixos numéricos com separadores (- ou .), incluindo espaços e quebras de linha
        formatted_name = re.sub(r'^\s*\d+\s*[\-\.]\s*', '', name, flags=re.S)
        return formatted_name.strip()


class FileService:
    @staticmethod
    def read_file(file: IO[bytes], course_id: str):
        try:
            course = Course.objects.get(id=uuid.UUID(course_id))

            regex_config = FileService.get_regex_config(course.category)

            text = FileService.extract_text(file)

            curriculum_block = FileService.find_curriculum_block(text, regex_config['curriculum_section_regex'], regex_config['subj_block_regex'])
            
            curriculum_list = FileService.parse_subjects(curriculum_block, regex_config)

            return curriculum_list
        except ValueError as e:
            logger.error(str(e))
            raise serializers.ValidationError({"Arquivo": "arquivo enviado não respeita os padrões de busca de dados."})

    @staticmethod
    def extract_text(file: IO[bytes], colado: bool = False) -> str:
        """
        Extrai o texto de um PDF e retorna planificado, removendo numeração de páginas
        quando a última linha da página contém apenas um número.
        
        :param file: arquivo PDF em bytes
        :param colado: se True, remove todas as quebras sem adicionar espaço
                    se False, mantém palavras separadas por espaço
        :return: texto planificado
        """

        pdf_document = fitz.open(stream=file.read(), filetype="pdf")
        text = ""

        def remove_page_number(page_text: str) -> str:
            lines = page_text.strip().splitlines()
            if lines:
                last_line = lines[-1].strip()
                # Remove apenas se a última linha for um número inteiro isolado
                if re.fullmatch(r'\d+', last_line):
                    lines = lines[:-1]
            return "\n".join(lines)

        for page in pdf_document:
            page_text = page.get_text("text")
            page_text = remove_page_number(page_text)
            text += page_text + "\n"

        pdf_document.close()

        # Função interna para planificar
        def limpar_texto(texto: str, colado: bool = False) -> str:
            if colado:
                return re.sub(r'[\r\n]+', '', texto)
            else:
                texto = re.sub(r'[\r\n]+', ' ', texto)
                texto = re.sub(r'\s+', ' ', texto)
                return texto.strip()

        return limpar_texto(text, colado)

    @staticmethod
    def find_curriculum_block(text: str, curriculum_regex: str, subject_block_regex: str) -> str:
        """
        Retorna o bloco de texto contendo a grade curricular do PDF.

        :param text: texto planificado do PDF
        :param curriculum_regex: regex que identifica 'Programa por Componentes Curriculares'
        :param subject_block_regex: regex que identifica blocos de disciplina (incluindo a tag)
        :return: string com o bloco da grade curricular
        """

        subject_block_regex = rf"({subject_block_regex}.*?)(?={subject_block_regex}|$)"

        # 1. Encontrar todas as ocorrências da regex do currículo
        curriculum_occurrences = list(re.finditer(curriculum_regex, text, flags=re.I))

        if not curriculum_occurrences:
            raise ValueError("Não foi encontrada a seção de 'Programa por Componentes Curriculares'.")

        # 2. Iterar sobre as ocorrências até achar uma que tenha blocos de disciplina
        for occ in curriculum_occurrences:
            start_index = occ.end()
            block_text = text[start_index:].strip()

            # 3. Encontrar todas as disciplinas no trecho
            subject_matches = list(re.finditer(subject_block_regex, block_text, flags=re.S))

            if subject_matches:
                # Junta todos os blocos completos de disciplina
                disciplinas = [m.group(0).strip() for m in subject_matches]
                return "\n\n".join(disciplinas)

        # 4. Se chegou aqui, não encontrou disciplinas em nenhuma ocorrência
        raise ValueError("Não foi possível extrair nenhum bloco de disciplina das ocorrências do currículo.")

    @staticmethod
    def parse_subjects(curriculum_block: str, regex_config: dict):
        """
        Extrai os dados das disciplinas obtidas em curriculum a partir da regex_config
        """

        pattern = f"({regex_config['subj_block_regex']})"

        split_list = re.split(pattern, curriculum_block, flags=re.S)

        raw_subj_list = []
        curriculum_list = []
        subjects_list = []

        # Recombinar cada delimitador com o conteúdo seguinte
        # O split gera: ['', delimiter1, content1, delimiter2, content2, ...]
        i = 0
        while i < len(split_list):
            if split_list[i].strip() == "":
                i += 1
                continue
            if i + 1 < len(split_list):
                block = split_list[i] + split_list[i + 1]  # delimiter + conteúdo
                i += 2
            else:
                block = split_list[i]
                i += 1
            raw_subj_list.append(block.strip())

        # Agora processa cada disciplina
        for subj in raw_subj_list:

            subject = {
                "name": "",
                "objective": "",
                "menu": "",
                "period": "",
                "weekly_periods": "",
                "subject_teach_workload": "",
                "subject_remote_workload": "",
                "subject_ext_workload": "",
                "pre_requisits": []
            }

            # Obrigatórios
            subj_name_match = re.search(regex_config['subj_name_regex'], subj, flags=re.S)
            subj_menu_match = re.search(regex_config['subj_menu_regex'], subj, flags=re.S)
            period_match = re.search(regex_config['period_regex'], subj, flags=re.S)
            weekly_periods_match = re.search(regex_config['weekly_periods_regex'], subj, flags=re.S)
            teach_workload_match = re.search(regex_config['teach_workload_regex'], subj, flags=re.S)

            # Opcionais
            subj_objective_match = None
            ext_workload_match = None
            remote_workload_match = None
            pre_requisits_match = None

            if regex_config.get('subj_objective_regex', None):
                subj_objective_match = re.search(regex_config['subj_objective_regex'], subj, flags=re.S)
            if regex_config.get('ext_workload_regex', None):
                ext_workload_match = re.search(regex_config['ext_workload_regex'], subj, flags=re.S)
            if regex_config.get('remote_workload_regex', None):
                remote_workload_match = re.search(regex_config['remote_workload_regex'], subj, flags=re.S)
            if regex_config.get('pre_requisits_regex', None):
                pre_requisits_match = re.search(regex_config['pre_requisits_regex'], subj, flags=re.S)

            if subj_name_match and subj_menu_match and period_match and weekly_periods_match and teach_workload_match:
                # Campos obrigatórios

                # Subject
                subject['name'] = FormatFileService.format_subject_name(re.sub(r'\s+', ' ', subj_name_match.group(1)).strip())
                subject['menu'] = re.sub(r'\s+', ' ', subj_menu_match.group(1)).strip()
                subject['objective'] = re.sub(r'\s+', ' ', subj_objective_match.group(1)).strip() if subj_objective_match else '---Não se aplica---'
                # Curriculum
                subject['subject_teach_workload'] = FormatFileService.format_str_to_number(teach_workload_match.group(1))
                subject['subject_remote_workload'] = FormatFileService.format_str_to_number(remote_workload_match.group(1)) if remote_workload_match else 0
                subject['subject_ext_workload'] = FormatFileService.format_str_to_number(ext_workload_match.group(1)) if ext_workload_match else 0
                subject['period'] = FormatFileService.format_str_to_number(period_match.group(1))
                subject['weekly_periods'] = FormatFileService.format_str_to_number(weekly_periods_match.group(1))
                subject['pre_requisits'] = FormatFileService.format_pre_requisits(pre_requisits_match.group(1) if pre_requisits_match else '')
                
                persisted_subject = FileService.persist_subject(subject)
                subjects_list.append(persisted_subject)

                curriculum_list.append(subject)

        final_curriculum_list = []

        for curriculum in curriculum_list:
            # Substitui pré-requisitos por IDs
            pre_req_ids = []
            for pre_req_name in curriculum['pre_requisits']:
                match_subj = next((s for s in subjects_list if s.name == pre_req_name), None)
                if match_subj:
                    pre_req_ids.append(str(match_subj.id))

            # Substitui o próprio "nome" da disciplina pelo ID
            match_subj = next((s for s in subjects_list if s.name == curriculum['name']), None)
            subject_id = str(match_subj.id) if match_subj else None

            # Cria dicionário final apenas com os campos necessários
            final_curriculum_list.append({
                "period": curriculum['period'],
                "weekly_periods": curriculum['weekly_periods'],
                "subject_teach_workload": curriculum['subject_teach_workload'],
                "subject_remote_workload": curriculum['subject_remote_workload'],
                "subject_ext_workload": curriculum['subject_ext_workload'],
                "pre_requisits": pre_req_ids,
                "subject": subject_id
            })

        return final_curriculum_list  
                
    @staticmethod
    def persist_subject(subject: dict):
        """
        Busca ou cria uma disciplina com base em nome, ementa e objetivo.
        Gera um código aleatório único de 8 dígitos.
        """
        try:

            # Função interna para gerar código aleatório
            def generate_unique_code():
                while True:
                    code = str(random.randint(10000000, 99999999))  # 8 dígitos
                    if not Subject.objects.filter(code=code).exists():
                        return code

            subj = Subject.objects.get(
                name=subject['name'],
                menu=subject['menu'],
                objective=subject['objective'],
            )

            return subj
        except Subject.DoesNotExist:
            # Busca por disciplina existente com mesmo nome, ementa e objetivo
                subj = Subject.objects.create(
                    name=subject['name'],
                    menu=subject['menu'],
                    objective=subject['objective'],
                    code=generate_unique_code()
                )

                return subj

    @staticmethod
    def get_regex_config(course_category: str):
        match course_category:
            case 'Técnico Integrado ao Ensino Médio':
                return {
                    'curriculum_section_regex': r"(\d+(?:\.\d+){0,2})\s+(PROGRAMA POR COMPONENTES CURRICULARES):?",
                    'subj_block_regex': r"Componente Curricular\s*:",
                    'subj_name_regex': r"Componente Curricular\s*:\s*(.*?)\s*(?=Ano\s*:)",
                    'subj_objective_regex': r"Objetivo geral do componente curricular\s*:\s*(.*?)\s*Ementa\s*:",
                    'subj_menu_regex': r"Ementa\s*:\s*(.*?)(?=\s*Referências|Referências Básicas)",
                    'period_regex': r"Ano\s*:\s*(.*?)\s*(?=Horas relógio:)",
                    'teach_workload_regex': r"Horas-aula\s*:\s*(.*?)\s*(?=Aulas na semana:)",
                    'weekly_periods_regex': r"Aulas na semana\s*:\s*(.*?)\s*(?=\s*Objetivo geral do componente curricular\s*:)"

                }
            case 'Técnico Subsequente ao Ensino Médio':
                return {
                    'curriculum_section_regex': r"(\d+(?:\.\d+){0,2})\s+(Programa por Componentes Curriculares):?",
                    'subj_block_regex': r"Componente Curricular\s*:",
                    'subj_name_regex': r"Componente Curricular\s*:\s*(.*?)\s*(?=Semestre\s*:)",
                    'subj_objective_regex': r"Objetivo geral do componente curricular\s*:\s*(.*?)\s*Ementa\s*:",
                    'subj_menu_regex': r"Ementa\s*:\s*(.*?)(?=\s*Referências|Referências Básicas)",
                    'period_regex': r"Semestre\s*:\s*(.*?)\s*(?=Horas relógio:)",
                    'teach_workload_regex': r"Horas aulas\s*:\s*(.*?)\s*(?=Aulas na semana:)",
                    'weekly_periods_regex': r"Aulas na semana\s*:\s*(.*?)\s*(?=\s*Objetivo geral do componente curricular\s*:)"
                }
            case 'Educação de Jovens e Adultos (ProEJA)':
                return {
                    'curriculum_section_regex': r"(\d+(?:\.\d+){0,2})\s+(Programa por Componentes Curriculares):?",
                    'subj_block_regex': r"Componente Curricular\s*:",
                    'subj_name_regex': r"Componente Curricular\s*:\s*(.*?)\s*(?=Semestre\s*:)",
                    'subj_objective_regex': r"Objetivo geral do componente curricular\s*:\s*(.*?)\s*Ementa\s*:",
                    'subj_menu_regex': r"Ementa\s*:\s*(.*?)(?=\s*Referências|Referências Básicas)",
                    'period_regex': r"Semestre\s*:\s*(.*?)\s*(?=Horas relógio:)",
                    'teach_workload_regex': r"Horas aulas\s*:\s*(.*?)\s*(?=Aulas na semana:)",
                    'remote_workload_regex': r"Carga horária a distância \(horas\)\s*:\s*(.*?)\s*(?=Horas aulas\s*:)",
                    'weekly_periods_regex': r"Aulas na semana\s*:\s*(.*?)\s*(?=\s*Objetivo geral do componente curricular\s*:)",
                }
            case 'Superior':
                return {
                    'curriculum_section_regex': r"(\d+(?:\.\d+){0,2})\s+(Programa por Componentes Curriculares):?",
                    'subj_block_regex': r"Componente Curricular\s*:",
                    'subj_name_regex': r"Componente Curricular\s*:\s*(.*?)\s*(?=Semestre\s*:)",
                    'subj_objective_regex': r"Objetivo geral do componente curricular\s*:\s*(.*?)\s*Ementa\s*:",
                    'subj_menu_regex': r"Ementa\s*:\s*(.*?)(?=\s*Referências|Referências Básicas)",
                    'period_regex': r"Semestre\s*:\s*(.*?)\s*(?=Horas relógio:)",
                    'teach_workload_regex': r"Horas-aula\s*:\s*(\d+)",
                    'remote_workload_regex': r"Carga horária a distância \(horas\)\s*:\s*(.*?)\s*(?=Horas-aula\s*:)",
                    'ext_workload_regex': r"Carga horária de extensão \(hora-relógio\)\s*:\s*(.*?)\s*(?=Objetivo geral do componente curricular\s*:)",
                    'weekly_periods_regex': r"Aulas na semana\s*:\s*(.*?)\s*(?=\s*Carga horária de extensão \(hora-relógio\)\s*:)",
                    "pre_requisits_regex": r"(?:Pré[-\s]?requisit(?:o|os)(?:\s+e\s+co-requisit(?:o|os))?):\s*(.*?)(?=(?:\d+(?:\.\d+){0,2}\s)|$)"
                }
            # case 'Especialização':
            #     return {
            #         'curriculum_section_regex': r"(\d+(?:\.\d+){0,2})\s+(PROGRAMA POR COMPONENTES CURRICULARES):?",
            #         'subj_block_regex': r"COMPONENTE CURRICULAR\s*:",
            #         'subj_name_regex': r"COMPONENTE CURRICULAR\s*:\s*(.*?)\s*(?=DOCENTES(S)\s*:)",
            #         'subj_menu_regex': r"EMENTA\s*:\s*(.*?)(?=\s*REFERÊNCIAS)",
            #         'period_regex': r"Semestre\s*:\s*(.*?)\s*(?=Horas relógio:)",
            #         'teach_workload_regex': r"Horas-aula\s*:\s*(\d+)",
            #         'remote_workload_regex': r"Carga horária a distância \(horas\)\s*:\s*(.*?)\s*(?=Horas-aula\s*:)",
            #         'ext_workload_regex': r"Carga horária de extensão \(hora-relógio\)\s*:\s*(.*?)\s*(?=Objetivo geral do componente curricular\s*:)",
            #     }



