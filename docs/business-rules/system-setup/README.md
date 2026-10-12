# Regras de negócio — setup do sistema

Este documento descreve os requisitos e a configuração inicial do Hub de
Sistemas IFRS conforme os arquivos Docker, `backend/.env.example`,
`frontend/.env.example`, `backend/backend/settings.py` e
`backend/entrypoint.py`.

## 1. Requisitos para executar com Docker

### Requisitos locais

- Docker Engine instalado e em execução.
- Docker Compose v2, disponível pelo comando `docker compose`.
- Portas locais `3000` (frontend) e `8000` (backend) disponíveis.
- Arquivos de ambiente locais criados a partir dos exemplos:

  ```bash
  cp backend/.env.example backend/.env
  cp frontend/.env.example frontend/.env
  ```

- Credenciais de cliente OAuth do Google configuradas no backend e no
  frontend para habilitar o login Google.

O Docker Compose de produção também baixa e executa PostgreSQL 16; não é
necessário instalar ou expor um PostgreSQL localmente.

### Execução pelo Docker Compose

Na raiz do repositório:

```bash
docker compose up --build
```

O stack da raiz inicia:

| Serviço | Função | Acesso local |
|---|---|---|
| `frontend` | Aplicação web servida pelo Vite | `http://localhost:3000` |
| `backend` | API Django executada com Uvicorn | `http://localhost:8000` |
| `db` | Banco PostgreSQL 16 | Interno à rede do Compose, porta 5432 |

O backend espera o banco ficar saudável. Na inicialização, instalações já
estão na imagem; o container executa `makemigrations`, `migrate`,
`compilemessages` e `entrypoint.py`, que configura grupos, permissões e o
servidor ASGI. Os dados do PostgreSQL ficam no volume nomeado
`postgres_data`; os módulos Node do frontend ficam no volume
`frontend_node_modules`.

O Compose da raiz define `ENVIRONMENT=prod` e `POSTGRES_HOST=db`, portanto o
backend usa PostgreSQL. Configure as variáveis `POSTGRES_*` em
`backend/.env`. O Compose também injeta `ROOT_USER` por interpolação do
ambiente do projeto Docker (shell ou `.env` na raiz do repositório); para
garantir a criação do administrador inicial, defina esse valor nesse
ambiente de interpolação.

### Desenvolvimento com Dev Containers

Como alternativa, o diretório `.devcontainer` fornece um ambiente de
desenvolvimento com backend em `ENVIRONMENT=dev` (SQLite) e frontend nos
mesmos endereços locais. Requer VS Code e a extensão Dev Containers. A rede
Docker externa `ifrs-dev-network` é criada pelo `initializeCommand` do
Dev Container quando ainda não existe. Python e Node.js são instalados nas
imagens; não precisam estar instalados no host.

## 2. Variáveis de ambiente

Os arquivos `.env.example` são modelos sem credenciais reais. Nunca publique
segredos, como `SECRET_KEY`, senha do banco ou `GOOGLE_OAUTH2_CLIENT_SECRET`.
O `GOOGLE_OAUTH2_CLIENT_ID` é compartilhado com o frontend; o
`GOOGLE_OAUTH2_CLIENT_SECRET` deve permanecer somente no backend.

### Backend — `backend/.env`

| Variável | Função e uso |
|---|---|
| `ENVIRONMENT` | Seleciona o banco: `dev` usa SQLite em `backend/db.sqlite3`; `prod` usa PostgreSQL e lê `POSTGRES_*`. O Compose da raiz sobrescreve para `prod`; o Dev Container define `dev`. |
| `DJANGO_SETTINGS_MODULE` | Módulo de configuração Django; o Compose define `backend.settings`. |
| `DEBUG` | Liga/desliga o modo de depuração Django. Configure `False` em produção. |
| `SECRET_KEY` | Chave secreta do Django usada para operações criptográficas, incluindo assinatura de tokens. Substitua o valor de exemplo por um segredo forte e único. |
| `ALLOWED_HOSTS` | Lista de hosts HTTP permitidos pelo Django, separada por vírgulas. |
| `CORS_ALLOWED_ORIGINS` | Lista de origens frontend autorizadas a fazer chamadas cross-origin, separada por vírgulas. |
| `GOOGLE_OAUTH2_CLIENT_ID` | Client ID usado pelo backend no fluxo OAuth do Google. Deve corresponder ao Client ID do frontend. |
| `GOOGLE_OAUTH2_CLIENT_SECRET` | Segredo OAuth usado pelo backend para autenticação com o Google. Não deve ser exposto ao frontend. |
| `REDIRECT_URI` | URI de callback Google usada no login do Django Admin; precisa corresponder à URI cadastrada na configuração OAuth do Google. |
| `BASE_SYSTEM_URL` | Configuração de URL base do sistema, com padrão `http://localhost:8000`. No código atual é carregada pelas settings, mas não há outro consumidor direto identificado no repositório. |
| `CAMPUS_CODE` | Sigla do campus, convertida para maiúsculas; usada na geração de códigos de disciplinas e deve conter exatamente três letras. Padrão: `IFR`. |
| `POSTGRES_DB` | Nome do banco PostgreSQL; usado quando `ENVIRONMENT=prod`. |
| `POSTGRES_USER` | Usuário do banco PostgreSQL; usado quando `ENVIRONMENT=prod`. |
| `POSTGRES_PASSWORD` | Senha do banco PostgreSQL; usada quando `ENVIRONMENT=prod`. Use uma senha segura. |
| `POSTGRES_HOST` | Host do PostgreSQL; no Compose, deve ser `db`. |
| `POSTGRES_PORT` | Porta PostgreSQL; padrão `5432`. |
| `AUTH_COOKIE_NAME` | Nome do cookie de acesso; padrão `access_token`. |
| `REFRESH_COOKIE_NAME` | Nome do cookie de renovação; padrão `refresh_token`. |
| `AUTH_COOKIE_HTTPONLY` | Define se os cookies de autenticação são inacessíveis ao JavaScript. Padrão `True`. |
| `AUTH_COOKIE_SECURE` | Define se os cookies só são enviados por HTTPS. Habilite (`True`) em produção HTTPS. |
| `AUTH_COOKIE_SAMESITE` | Política `SameSite` dos cookies; padrão `Lax`. |
| `AUTH_COOKIE_REFRESH_MAX_AGE` | Duração do cookie de refresh, em segundos; padrão 604800 (7 dias). |
| `AUTH_COOKIE_REFRESH_PATH` | Caminho HTTP do cookie de refresh; padrão `/`. |
| `AUTH_COOKIE_ACCESS_PATH` | Caminho HTTP do cookie de acesso; padrão `/`. |
| `ROOT_USER` | Email que o `entrypoint.py` promove a superusuário ativo e associa ao grupo `admin`. É opcional; no Compose raiz, disponibilize-o também no ambiente de interpolação do Compose. |
| `RUNSERVER_HOST` | Endereço de escuta do Uvicorn. No Compose deve aceitar conexões do container, por exemplo `0.0.0.0`; padrão do entrypoint: `127.0.0.1`. |
| `RUNSERVER_PORT` | Porta de escuta do Uvicorn; padrão `8000`. |
| `RUNSERVER_RELOAD` | Se `true`, `1` ou `yes`, inicia Uvicorn com recarga automática; padrão `false`. |
| `TZ` | Fuso horário do processo/container, definido no exemplo como `America/Sao_Paulo`. A configuração Django `TIME_ZONE` permanece `UTC`. |

Se `ROOT_USER` não estiver definido, o entrypoint tenta associar ao grupo
`admin` o primeiro usuário já cadastrado. Essa alternativa não o promove a
superusuário Django.

O `backend/.env.example` inclui valores de desenvolvimento para facilitar a
configuração inicial. Eles não substituem a configuração segura de produção.
Em particular, o código Django tem um valor de fallback para `SECRET_KEY` e
`DEBUG`; não dependa desses padrões em produção.

### Frontend — `frontend/.env`

| Variável | Função e uso |
|---|---|
| `VITE_API_URL` | URL base para as chamadas HTTP do frontend ao backend, incluindo a barra final, por exemplo `http://localhost:8000/`. |
| `VITE_GOOGLE_OAUTH2_CLIENT_ID` | Client ID público usado pelo SDK Google no frontend. Deve ser igual a `GOOGLE_OAUTH2_CLIENT_ID` do backend. O frontend interrompe sua inicialização se estiver vazio. |

O Compose raiz também define `CHOKIDAR_USEPOLLING=true` e
`WATCHPACK_POLLING=true` para observação de arquivos em volumes Docker.
O Dev Container usa a mesma estratégia por sua configuração de execução.
Essas variáveis são operacionais para desenvolvimento e não são configurações
de negócio da aplicação.

## 3. Grupos padrão e permissões iniciais

Em cada execução, `entrypoint.py` garante os grupos abaixo com
`get_or_create` e substitui suas permissões pelas listas descritas nesta
seção. Assim, alterações manuais às permissões desses grupos podem ser
substituídas na próxima inicialização do backend.

| Grupo | Permissões atribuídas por padrão |
|---|---|
| `admin` | Todas as permissões que restarem no banco após a limpeza do entrypoint. Inclui permissões de adicionar, alterar, excluir e visualizar dos modelos permitidos abaixo e eventuais permissões customizadas desses modelos. |
| `user` | Todas as permissões `view_*` que restarem; mais `add_personalinfos` e `add_accountinfos`, e `add_additionalinfos` se essa permissão existir. `delete_curriculum` é removida. |
| `coord` | O mesmo conjunto inicial de `user`: permissões `view_*`, mais as permissões de adição de informações pessoais e da conta (e `add_additionalinfos`, se existir); `delete_curriculum` é removida. |

As permissões padrão do Django têm codenames `add_<modelo>`,
`change_<modelo>`, `delete_<modelo>` e `view_<modelo>`. O entrypoint mantém
permissões somente para os seguintes modelos permitidos:

| Aplicação | Modelo(s) | Permissões padrão retidas |
|---|---|---|
| `hub_users` | `user`, `password`, `personalinfos`, `accountinfos`, `accessrequest`, `bindrequest` | `add_*`, `change_*`, `delete_*`, `view_*` |
| `hub_systems` | `system` | `add_*`, `change_*`, `delete_*`, `view_*` |
| `auth` | `group` | `add_*`, `change_*`, `delete_*`, `view_*` |
| `auth` | `permission` | Somente `view_permission` |
| `hub_calendars` | `calendar`, `event` | `add_*`, `change_*`, `delete_*`, `view_*` |
| `hub_academic` | `courseclass`, `course`, `ppc`, `curriculum`, `subject` | `add_*`, `change_*`, `delete_*`, `view_*` |

Por exemplo, `view_user` é atribuída a `user` e `coord`, e as quatro
permissões `add_user`, `change_user`, `delete_user` e
`view_user` ficam disponíveis para `admin`. A mesma regra de prefixos
vale para os demais modelos listados. Exceções importantes:

- `user` e `coord` recebem `add_personalinfos` e `add_accountinfos`, além das
  permissões de visualização; essas permissões permitem o cadastro de dados
  pessoais e dados da conta.
- `add_additionalinfos` é uma permissão customizada legada, atribuída a `user`
  e `coord` somente se existir no banco.
- As permissões de alteração e exclusão do modelo Django `auth.Permission`
  (`change_permission` e `delete_permission`) e a permissão
  `add_permission` são removidas pelo entrypoint. Portanto, ficam disponíveis
  para nenhum grupo; `view_permission` continua retida e é atribuída a todos
  os três grupos.
- Permissões ligadas a modelos fora da lista permitida são removidas.

Os grupos padrão criados pelo entrypoint são somente `admin`, `coord` e
`user`; perfis de acesso como `aluno`, `servidor` e `convidado` são campos da
conta, não grupos criados por essa rotina.
