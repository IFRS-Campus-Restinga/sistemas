import random
import re
import fitz  # PyMuPDF
from django.core.management.base import BaseCommand
from ...models.subject import Subject
from ...models.course import Course
from ...models.ppc import PPC, Curriculum


class Command(BaseCommand):
    help = "Importa grade curricular do PPC a partir de PDFs longos (catálogo de curso)"

    def add_arguments(self, parser):
        parser.add_argument(
            "pdfs",
            nargs="+",
            type=str,
            help="Caminhos para os arquivos PDF a importar",
        )

    def handle(self, *args, **options):
        pdfs = options["pdfs"]

        for pdf_path in pdfs:
            self.stdout.write(self.style.NOTICE(f"Lendo arquivo: {pdf_path}"))
            text = self.extract_text_from_pdf(pdf_path)
            subjects = self.parse_subjects(text)
            self.stdout.write(f"→ {len(subjects)} disciplinas encontradas em {pdf_path}")

            for subj in subjects:
                created = self.save_subject_to_db(subj)
                if created:
                    new_count += 1
                else:
                    ignored_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Importação concluída: {new_count} novas, {ignored_count} já existentes."
        ))

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extrai todo o texto de um PDF longo e normaliza quebras de linha."""
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            page_text = page.get_text("text")
            text += page_text + "\n"

        # Normalizar quebras de linha
        normalized = []
        for line in text.splitlines():
            line = line.strip()
            if not line:
                continue
            if normalized and not normalized[-1].endswith((".", ":", ";")):
                normalized[-1] += " " + line
            else:
                normalized.append(line)

        return "\n".join(normalized)

    def parse_subjects(self, text: str):
        subjects = []
        print_block = True

        blocks = re.split(r"Componente Curricular\s*:", text, flags=re.S)

        for block in blocks[1:]:
            subj = {
                'name': '',
                'objective': '',
                'menu': ''
            }

            clean_block = re.sub(r"\s+", " ", block)

            # Captura tudo antes de "Semestre" ou "Ano" como nome
            name_match = re.search(r"(.*?)(Semestre\s*:|Ano\s*:)", clean_block, flags=re.S)

            # Captura objetivo: tudo entre "Objetivo geral do:" e "Ementa:"
            objective_match = re.search(r"Objetivo geral do componente curricular\s*:\s*(.*?)\s*Ementa\s*:", clean_block, flags=re.S)

            # Captura ementa: tudo entre "Ementa:" e "Referências Básicas:"
            menu_match = re.search(r"Ementa\s*:\s*(.*?)\s*Referências Básicas\s*:", clean_block, flags=re.S)

            if name_match and objective_match and menu_match:
                subj["name"] = re.sub(r"\s+", " ", name_match.group(1)).strip()
                subj["objective"] = re.sub(r"\s+", " ", objective_match.group(1)).strip()
                subj["menu"] = re.sub(r"\s+", " ", menu_match.group(1)).strip()

                subjects.append(subj)

        return subjects

    def generate_unique_code(self):
        """Gera um código único de até 5 dígitos."""
        while True:
            code = str(random.randint(1, 99999)).zfill(5)
            if not Subject.objects.filter(code=code).exists():
                return code

    def save_subject_to_db(self, subj):
        """
        Salva a disciplina no banco.
        Evita duplicados com mesmo nome + objetivo + ementa.
        Retorna True se criou, False se ignorou.
        """
        exists = Subject.objects.filter(
            name=subj["name"].strip(),
            objective=subj["objective"].strip(),
            menu=subj["menu"].strip()
        ).exists()

        if exists:
            self.stdout.write(self.style.NOTICE(
                f"Disciplina '{subj['name']}' já existe com mesmos dados, ignorada."
            ))
            return False

        code = self.generate_unique_code()
        Subject.objects.create(
            name=subj["name"].strip(),
            code=code,
            objective=subj["objective"].strip(),
            menu=subj["menu"].strip(),
        )
        self.stdout.write(self.style.SUCCESS(
            f"Disciplina '{subj['name']}' cadastrada com código {code}."
        ))
        return True
