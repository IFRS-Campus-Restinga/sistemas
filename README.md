Dependências:
- Python 3.11.3
- Git 2.45.2.windows.1

Para executar o projeto localmente:

Clonar a Branch Main

- ```git clone https://github.com/IFRS-Campus-Restinga/sistemas```
- ```cd sistemas```
- ```cd backend```
- ```python -m venv .venv``` (cria um ambiente virtual para instalação das dependências de maneira isolada)
- ```.\.venv\Scripts\activate``` (ativa o ambiente virtual)
- ```pip install -r requirements.txt```
- ```py manage.py makemigrations```
- ```py manage.py migrate```
- ```py manage.py createsuperuser``` (cadastre qualquer email do google)
- ```py entrypoint.py```

