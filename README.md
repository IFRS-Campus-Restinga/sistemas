# Hub de Sistemas do IFRS

## Pré-requisitos

- Python 3.11 ou superior
- Node.js 22 ou superior
- Git
- GNU gettext (`msgfmt`), necessário para `compilemessages`
- Docker e Docker Compose, caso deseje subir o backend em container

Clone a branch `dev`:

```bash
git clone https://github.com/IFRS-Campus-Restinga/sistemas
cd sistemas
git checkout dev
```

## Arquivos de variáveis de ambiente

Antes de iniciar o projeto, crie os arquivos de ambiente a partir dos modelos já provisionados no repositório:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Preencha os valores conforme o ambiente que será utilizado.

### Backend: `backend/.env`

O arquivo [backend/.env.example](/mnt/c/Users/User/Desktop/sistemas/backend/.env.example) contém as variáveis esperadas pelo backend.

Principais campos:

- `DB_ENGINE`: use `sqlite` para desenvolvimento local simples ou `postgres` para execução com Docker.
- `INITIAL_ADMIN_EMAIL`: email Google do usuário que será promovido para administração inicial do sistema.
- `GOOGLE_OAUTH2_CLIENT_ID`: client ID usado na autenticação com Google.
- `BASE_SYSTEM_URL`: URL base do frontend. Em desenvolvimento local, normalmente `http://127.0.0.1:5173`.
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`: obrigatórios quando `DB_ENGINE=postgres`.

Observação:

- Em desenvolvimento local, o projeto usa SQLite por padrão e instala apenas as dependências de [backend/requirements.txt](/mnt/c/Users/User/Desktop/sistemas/backend/requirements.txt).
- A dependência específica de PostgreSQL é instalada apenas no build do container.

### Frontend: `frontend/.env`

O arquivo [frontend/.env.example](/mnt/c/Users/User/Desktop/sistemas/frontend/.env.example) contém as variáveis usadas pelo Vite:

- `VITE_API_URL`: URL base da API. Em desenvolvimento local, normalmente `http://127.0.0.1:8000/api/`.
- `VITE_GOOGLE_OAUTH2_CLIENT_ID`: mesmo client ID do Google configurado no backend.

## Subida em desenvolvimento local

Este modo pressupõe Python e Node instalados na máquina.

### 1. Subir o backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python entrypoint.py
```

No Windows, a ativação do ambiente virtual pode ser feita com:

```powershell
.\.venv\Scripts\activate
```

Observações:

- Se quiser autenticar e administrar o sistema com uma conta Google específica, defina `INITIAL_ADMIN_EMAIL` no `backend/.env` antes de subir o backend.
- O `entrypoint.py` aplica a configuração inicial e sobe o Django em `127.0.0.1:8000` por padrão.

### 2. Subir o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Por padrão, o frontend sobe em `http://127.0.0.1:5173`.

### 3. Dependência adicional no Windows

Instale o GNU gettext para suportar `compilemessages`.

Opções:

- MSYS2:
  - instale em https://www.msys2.org
  - abra o terminal "MSYS2 MinGW 64-bit"
  - rode `pacman -S --needed mingw-w64-x86_64-gettext`
  - adicione `C:\msys64\mingw64\bin` ao `PATH`
- Chocolatey:
  - rode `choco install gettext`

## Subida em container

Atualmente o `docker-compose.yml` disponível está em [backend/docker-compose.yml](/mnt/c/Users/User/Desktop/sistemas/backend/docker-compose.yml) e sobe o backend com PostgreSQL.
O projeto Compose foi nomeado como `hub_ifrs_container`, que será o identificador usado para o agrupamento dos serviços.

Antes de iniciar, ajuste o [backend/.env.example](/mnt/c/Users/User/Desktop/sistemas/backend/.env.example) copiado para `backend/.env` com valores compatíveis com Postgres, por exemplo:

```env
DB_ENGINE=postgres
INITIAL_ADMIN_EMAIL=seu-email@dominio.com
GOOGLE_OAUTH2_CLIENT_ID=seu-client-id
BASE_SYSTEM_URL=http://127.0.0.1:5173
POSTGRES_DB=sistemas
POSTGRES_USER=sistemas
POSTGRES_PASSWORD=sistemas
POSTGRES_HOST=db
POSTGRES_PORT=5432
TZ=America/Sao_Paulo
```

Depois execute:

```bash
cd backend
docker compose up --build
```

Esse comando sobe:

- backend em `http://127.0.0.1:8000`
- banco PostgreSQL em `localhost:5432`

No build do backend em container, o Docker instala [backend/requirements.txt](/mnt/c/Users/User/Desktop/sistemas/backend/requirements.txt) e adiciona `psycopg2-binary==2.9.9` diretamente no ambiente do container.

## Cadastro de sistema após a subida

Depois que a aplicação estiver no ar, o cadastro de um sistema depende de um aluno já existente.

Fluxo recomendado:

1. Cadastre o usuário do tipo `aluno`.
2. Ao cadastrar o sistema, vincule esse aluno à equipe de desenvolvimento (`dev_team`) do sistema.
3. Após salvar o sistema, abra a tela de detalhes do sistema.
4. Copie o `ID do sistema` e a `Chave de API do sistema`.
5. Cadastre esses valores como variáveis de ambiente no sistema cliente que será integrado ao hub.

Importante:

- A `api_key` é gerada automaticamente no cadastro do sistema.
- O `dev_team` aceita apenas usuários ativos com perfil `aluno`.
- A visualização da `api_key` nos detalhes depende de o usuário ser administrador ou pertencer ao `dev_team` de um sistema que esteja `Em desenvolvimento`.

## Documentação das APIs

Veja a documentação completa em [docs/API.md](/mnt/c/Users/User/Desktop/sistemas/docs/API.md).
