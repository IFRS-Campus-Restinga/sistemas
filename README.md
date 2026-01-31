Dependências:
- Python 3.11.3
- Node 22.14.0
- Git 2.45.2.windows.1
- GNU gettext (msgfmt) para `compilemessages`

Para executar o projeto localmente:

Clonar a Branch "dev"!

#BACKEND
- ```git clone https://github.com/IFRS-Campus-Restinga/sistemas```
- ```cd backend```
- ```python -m venv .venv``` (cria um ambiente virtual para instalação das dependências de maneira isolada)
- ```.\.venv\Scripts\activate``` (ativa o ambiente virtual)
- ```pip install -r requirements.txt```
- Instale o GNU gettext (necessário para `compilemessages`):
  - MSYS2:
    - baixe e instale em https://www.msys2.org
    - abra "MSYS2 MinGW 64-bit" e rode: ```pacman -S --needed mingw-w64-x86_64-gettext```
    - adicione ```C:\msys64\mingw64\bin``` ao PATH do Windows
  - ou Chocolatey:
    - ```choco install gettext```
- ```py manage.py makemigrations```
- ```py manage.py migrate```
- ```py manage.py createsuperuser``` (cadastre qualquer email do google)
- ```py manage.py entrypoint.py```

#FRONTEND
- ```cd frontend```
- ```npm i```
- ```npm run dev```

## Documentacao das APIs

Veja a documentacao completa em `docs/API.md`.
