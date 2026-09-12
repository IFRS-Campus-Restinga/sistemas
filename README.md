# Hub de Sistemas do IFRS

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose
- [VS Code](https://code.visualstudio.com/) com a extensão [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) *(apenas para modo desenvolvimento)*

## Clonando o repositório

```bash
git clone https://github.com/IFRS-Campus-Restinga/sistemas
cd sistemas
```

## Configurando as variáveis de ambiente

Crie os arquivos de ambiente a partir dos modelos provisionados no repositório:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Preencha os valores conforme descrito abaixo.

### Backend: `backend/.env`

| Variável | Descrição | Obrigatório |
|---|---|---|
| `ENVIRONMENT` | `dev` em desenvolvimento, `prod` em produção | Sim |
| `DEBUG` | `True` ou `False` | Sim |
| `SECRET_KEY` | Chave secreta do Django — troque em produção | Sim |
| `ALLOWED_HOSTS` | Hosts permitidos separados por vírgula | Sim |
| `CORS_ALLOWED_ORIGINS` | Origens CORS permitidas separadas por vírgula | Sim |
| `GOOGLE_OAUTH2_CLIENT_ID` | Client ID do Google OAuth | Sim |
| `GOOGLE_OAUTH2_CLIENT_SECRET` | Client Secret do Google OAuth | Sim |
| `REDIRECT_URI` | URI de redirecionamento do OAuth Google | Sim |
| `BASE_SYSTEM_URL` | URL base do backend (ex: `http://localhost:8000`) | Sim |
| `AUTH_COOKIE_NAME` | Nome do cookie de acesso | Sim |
| `REFRESH_COOKIE_NAME` | Nome do cookie de refresh | Sim |
| `AUTH_COOKIE_HTTPONLY` | Habilita flag HttpOnly nos cookies | Sim |
| `AUTH_COOKIE_SECURE` | Habilita flag Secure nos cookies (use `True` em HTTPS) | Sim |
| `AUTH_COOKIE_SAMESITE` | Política SameSite dos cookies (`Lax`, `Strict` ou `None`) | Sim |
| `AUTH_COOKIE_REFRESH_MAX_AGE` | Validade do cookie de refresh em segundos | Sim |
| `AUTH_COOKIE_REFRESH_PATH` | Path do cookie de refresh | Sim |
| `AUTH_COOKIE_ACCESS_PATH` | Path do cookie de acesso | Sim |
| `POSTGRES_DB` | Nome do banco de dados PostgreSQL | Obrigatório em produção |
| `POSTGRES_USER` | Usuário do PostgreSQL | Obrigatório em produção |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL | Obrigatório em produção |
| `POSTGRES_HOST` | Host do PostgreSQL (use `db` quando em container) | Obrigatório em produção |
| `POSTGRES_PORT` | Porta do PostgreSQL | Obrigatório em produção |
| `ROOT_USER` | Email Google do usuário promovido a administrador inicial | Recomendado |
| `TZ` | Fuso horário (ex: `America/Sao_Paulo`) | Sim |

> Em desenvolvimento (`ENVIRONMENT=dev`), o backend usa SQLite automaticamente — as variáveis `POSTGRES_*` são ignoradas.
> Em produção (`ENVIRONMENT=prod`), o PostgreSQL é obrigatório e as variáveis `POSTGRES_*` precisam estar preenchidas.

### Frontend: `frontend/.env`

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API do backend (ex: `http://localhost:8000/`) |
| `VITE_GOOGLE_OAUTH2_CLIENT_ID` | Mesmo Client ID do Google configurado no backend |

---

## Modo desenvolvimento (Dev Containers)

O ambiente de desenvolvimento é gerenciado pelo VS Code via Dev Containers. Não é necessário ter Python ou Node.js instalados localmente.

1. Abra o repositório no VS Code.
2. Quando solicitado, clique em **"Reopen in Container"** — ou acesse via `Ctrl+Shift+P` → `Dev Containers: Reopen in Container`.
3. O VS Code irá construir as imagens e iniciar os serviços automaticamente.

Após a inicialização, os serviços estarão disponíveis em:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

O container de backend usa `ENVIRONMENT=dev` por padrão, portanto SQLite é utilizado como banco de dados e o volume do workspace é montado para hot-reload.

---

## Modo produção (Docker Compose)

O `docker-compose.yml` na raiz do projeto sobe o stack completo com backend, frontend e PostgreSQL.

Antes de iniciar, ajuste o `backend/.env` com valores compatíveis com produção:

```env
ENVIRONMENT=prod
DEBUG=False
SECRET_KEY=chave-secreta-forte
ALLOWED_HOSTS=seu-dominio.com,www.seu-dominio.com
CORS_ALLOWED_ORIGINS=https://seu-dominio.com
GOOGLE_OAUTH2_CLIENT_ID=seu-client-id
GOOGLE_OAUTH2_CLIENT_SECRET=seu-client-secret
REDIRECT_URI=https://seu-dominio.com/django-admin/google/callback/
BASE_SYSTEM_URL=https://seu-dominio.com
AUTH_COOKIE_SECURE=True
POSTGRES_DB=hub_sistemas_ifrs
POSTGRES_USER=postgres
POSTGRES_PASSWORD=senha-forte
POSTGRES_HOST=db
POSTGRES_PORT=5432
ROOT_USER=seu-email@dominio.com
TZ=America/Sao_Paulo
```

E no `frontend/.env`:

```env
VITE_API_URL=https://seu-dominio.com/
VITE_GOOGLE_OAUTH2_CLIENT_ID=seu-client-id
```

Depois execute na raiz do projeto:

```bash
docker compose up --build
```

O comando sobe:

- Backend em `http://localhost:8000`
- Frontend em `http://localhost:3000`
- Banco PostgreSQL (interno, não exposto externamente)

---

## Cadastro de sistema após a subida

Após a aplicação estar no ar, o cadastro de um sistema depende de um aluno já existente.

Fluxo recomendado:

1. Cadastre um usuário do tipo `aluno`.
2. Ao cadastrar o sistema, vincule esse aluno ao `dev_team` do sistema.
3. Abra a tela de detalhes do sistema.
4. Copie o `ID do sistema` e a `Chave de API do sistema`.
5. Cadastre esses valores como variáveis de ambiente no sistema cliente que será integrado ao hub.

Observações:

- A `api_key` é gerada automaticamente no cadastro do sistema.
- O `dev_team` aceita apenas usuários ativos com perfil `aluno`.
- A `api_key` é visível apenas para administradores ou membros do `dev_team` de sistemas com status `Em desenvolvimento`.

---

## Documentação das APIs

Veja a documentação completa em [docs/API.md](docs/API.md).
