# Documentacao das APIs

Este documento descreve todas as APIs expostas pelo backend (Django + DRF).

## Base URL

- Backend local: `http://127.0.0.1:8000/`
- Prefixos principais:
  - Sessao/autenticacao: `/session/`
  - Django admin (Google OAuth): `/django-admin/`
  - Recursos de negocio: `/api/...`

## Autenticacao e autorizacao

O backend usa JWT em cookies HTTP only:
- `access_token`: expira em ~5 minutos.
- `refresh_token`: expira em 7 dias.

Fluxos principais:
- `POST /session/login/` (email + senha) ou `POST /session/login/google/` (Google).
- Se **nao** existir query param `system`, o backend grava os cookies (`access_token`, `refresh_token`).
- `GET /session/token/refresh/` renova o `access_token` usando o cookie `refresh_token`.
- `POST /session/logout/` remove os cookies.

Autorizacao:
- A maioria das rotas usa `@has_permissions([...])`.
- O middleware espera um `access_token` valido (cookie) e valida permissoes.

Credencial de sistema (quando aplicavel):
- Algumas rotas aceitam o cookie `system` com a `api_key` do sistema.

## Paginacao

Listagens usam `PageNumberPagination` do DRF:
- Query params: `page` e `page_size`
- Resposta: `{ count, next, previous, results }`

## Parametro `fields` (obrigatorio em GETs de recursos)

Para quase todas as rotas GET que retornam dados de modelos, o query param
`fields` e **obrigatorio**, por exemplo:

`/api/users/get/<user_id>/?fields=id,username,groups.id,groups.name,access_profile`

Se `fields` nao for informado, a API responde erro de validacao.

## Padrao de erro

Em geral:
- Erros de validacao: `400` com `{"message": ...}`
- Nao encontrado: `404` com `{"message": "..."}`
- Sem permissao: `403` com `{"message": "..."}`

---

# Sessao / Autenticacao

## POST `/session/login/`
Login por email/senha (apenas para contas com senha local).

Body:
```json
{
  "email": "user@email.com",
  "password": "minha-senha"
}
```

Query params:
- `system` (opcional): se presente, **nao** grava cookies.

Resposta `200`:
```json
{
  "user": {
    "id": "uuid",
    "username": "Nome",
    "groups": ["admin", "user"],
    "access_profile": "aluno|servidor|convidado",
    "first_login": true,
    "is_abstract": false
  }
}
```

## POST `/session/login/google/`
Login via Google OAuth (token do Google no frontend).

Body:
```json
{
  "credential": "google-id-token",
  "accessProfile": "aluno|servidor|convidado"
}
```

Query params:
- `system` (opcional): se presente, **nao** grava cookies.

Resposta `200`: igual ao login comum.

Observacao:
- Se o usuario for criado nesse fluxo e `accessProfile != aluno`,
  a resposta pode retornar `user = null` (conta nao ativada).

## GET `/session/token/refresh/`
Renova o `access_token` usando o cookie `refresh_token`.

Resposta `200`:
```json
{ "message": "Token renovado" }
```

## POST `/session/logout/`
Remove os cookies de sessao.

Resposta `200`:
```json
{ "message": "Logout concluido com sucesso" }
```

## GET `/django-admin/admin/login/`
Redireciona para o fluxo OAuth do Google do Django Admin.

## GET `/django-admin/google-callback/`
Callback do OAuth (usado pelo Django Admin).

---

# Usuarios

Base: `/api/users/`

## POST `create/`
Cria uma conta de visitante. O cadastro de aluno ou servidor ocorre por outros
fluxos de autenticacao e nao por este endpoint.

Body:
```json
{
  "email": "user@email.com",
  "first_name": "Nome",
  "last_name": "Sobrenome",
  "password": "senha-do-convidado"
}
```

Resposta `201`:
```json
{
  "message": "Conta criada com sucesso",
  "confirmation_id": "uuid-da-confirmacao"
}
```

O cadastro de convidado por email e senha cria um código de confirmação de seis
dígitos com validade de 10 minutos. O envio de email ainda não está configurado;
o código não é incluído na resposta. A conta e criada com perfil `convidado`,
inativa e com `email_verified` falso, e recebe uma solicitacao de acesso.
`accessProfile` nao e usado por este endpoint.

## POST `email-confirmation/<confirmation_id>/`
Confirma o email de um cadastro de convidado. Não requer autenticação nem
permissões.

Body:
```json
{
  "confirmation_code": "123456"
}
```

Resposta `200`:
```json
{ "message": "Email confirmado com sucesso" }
```

O código expirado ou incorreto retorna `400`; uma confirmação inexistente ou já
utilizada retorna `404`. A confirmação não ativa a conta: o convidado continua
aguardando aprovação administrativa.

## PUT `email-confirmation/<confirmation_id>/regenerate/`
Gera outro código para a confirmação pendente identificada pelo ID, substitui o
código anterior e renova sua expiração por 10 minutos. Não requer autenticação
nem permissões e não recebe corpo na requisição.

Resposta `200`:
```json
{
  "message": "Um novo código foi gerado e tem validade de 10 minutos. O envio de email ainda não está configurado."
}
```

Uma confirmação inexistente ou já utilizada retorna `404`. O novo código não é
incluído na resposta.

## GET `get/data/`
Retorna os dados predefinidos do usuario autenticado pelo cookie `access_token`.
Nao recebe `fields` nem exige a permissao `view_user`; requer uma credencial de
acesso valida.

Exemplo de resposta:
```json
{
  "id": "uuid-do-usuario",
  "username": "Nome Sobrenome",
  "groups": ["user"],
  "permissions": ["change_personalinfos"],
  "access_profile": "aluno",
  "is_abstract": false,
  "personal_infos": "uuid-dos-dados-pessoais",
  "account_infos": "uuid-dos-dados-da-conta",
  "first_login": true
}
```

`personal_infos` e `account_infos` podem ser `null` se ainda nao estiverem
associados. `first_login` so aparece quando seu valor e verdadeiro.
`permissions` e a lista sem duplicatas dos codenames concedidos pelos grupos do
usuario.

## GET `get/<user_id>/`
Retorna dados do usuario.

Query params:
- `fields` (obrigatorio)

Permissao: `view_user`

Os campos selecionaveis correspondem ao modelo `User` e suas relacoes. Campos
principais:

| Campo | Tipo / descricao |
| --- | --- |
| `id` | UUID do usuario. |
| `username` | Nome exibido (ate 100 caracteres). |
| `email` | Email unico, usado como identificador de login. |
| `access_profile` | Perfil: `aluno`, `servidor` ou `convidado`. |
| `is_active` | Indica se a conta esta ativa; novas contas de convidado aguardam aprovacao. |
| `email_verified` | Indica se o email foi confirmado. |
| `is_abstract` | Indica conta do tipo Departamento; o padrao e `false`. |
| `first_login` | Indica primeiro acesso; o padrao e `true`. |
| `date_joined` | Data e hora de criacao da conta. |
| `is_staff`, `is_superuser` | Indicadores de acesso administrativo herdados de `AbstractUser`. |
| `personal_infos` | FK anulavel para `PersonalInfos`; selecione subcampos com `personal_infos.<campo>`. |
| `account_infos` | FK anulavel para `AccountInfos`; selecione subcampos com `account_infos.<campo>`. |
| `groups` | Grupos do usuario; `groups.id` retorna o UUID publico do `GroupUUIDMap`. |

O model `User` usa `email` como identificador e nao armazena a senha nesse
registro. A senha de convidados e mantida separadamente no model `Password`,
que possui `id` (UUID), `password` e uma relacao um-para-um com `User`.

## GET `get/group/<group_name>/`
Lista usuarios por grupo.

Query params:
- `fields` (obrigatorio)
- `search` (opcional)
- `status` (opcional): `Ativo` ou `Inativo`
- `page`, `page_size` (opcional)

Permissao: `view_user`

## GET `get/access_profile/<access_profile_name>/`
Lista usuarios por perfil (`aluno`, `servidor`, `convidado`).

Query params:
- `fields` (obrigatorio)
- `search` (opcional)
- `status` (opcional): `Ativo` ou `Inativo`
- `page`, `page_size` (opcional)

Permissao: `view_user`

## PUT `edit/<user_id>/`
Edita usuario.

Permissao: `change_user`

Body (exemplo):
```json
{
  "username": "Nome Completo",
  "email": "user@email.com",
  "access_profile": "aluno",
  "groups": [
    { "id": "uuid-do-grupo" }
  ],
  "is_active": true,
  "is_abstract": false
}
```

Observacao:
- Envie `groups` como uma lista; `groups[].id` deve ser o UUID publico do
  `GroupUUIDMap`, nao o ID numerico interno do Django.
- `username`, `email` e `access_profile` sao campos do usuario. `access_profile`
  aceita `aluno`, `servidor` ou `convidado`.
- Regras de grupo/perfil: `admin` nao pode ser combinado com `user`; perfis
  `aluno` e `convidado` nao podem ter `admin`; perfil `convidado` nao pode ter
  `coord`.
- Contas `convidado` devem ser do tipo pessoal (`is_abstract: false`).
- Nao e permitido alterar `is_abstract` depois que o usuario possui dados
  pessoais ou dados da conta associados.

## GET `/api/requests/get/`
Lista os usuarios associados a registros de `AccessRequest`. Novas contas de
servidor ou convidado criadas pelos fluxos de cadastro recebem um registro de
solicitacao. O campo `id` de cada resultado e o ID da solicitacao, usado nos
endpoints de aprovacao e rejeicao; `user_id` identifica o usuario associado.

Query params:
- `fields` (obrigatorio)
- `page`, `page_size` (opcional)

Permissao: `view_user`

## PUT `/api/requests/<request_id>/approve/`
Aprova a requisicao identificada por `request_id`, buscando o usuario pela
relacao da solicitacao. A aprovacao ativa o usuario e remove o registro de
`AccessRequest`.

Permissao: `change_user`

Body:
```json
{
  "groups": [
    { "id": "uuid-do-grupo" }
  ],
  "is_abstract": false
}
```

## DELETE `/api/requests/<request_id>/decline/`
Recusa a requisicao identificada por `request_id`, remove o registro de
`AccessRequest` e exclui o usuario vinculado.

Permissao: `delete_user`

## Requisicoes de vinculo de dados pessoais

### GET `/api/requests/bind/count/`
Retorna a quantidade de solicitacoes `BindRequest` pendentes para os dados
pessoais associados a conta autenticada:

```json
{
  "count": 3
}
```

### GET `/api/requests/bind/pending/`
Informa se a conta autenticada possui uma solicitacao de vinculo pessoal
aguardando aprovacao:

```json
{
  "pending": true
}
```

### GET `/api/requests/bind/`
Lista as solicitacoes `BindRequest` relacionadas ao registro `PersonalInfos`
da conta autenticada. Cada item retorna o nome, email e perfil de acesso do usuario
solicitante:

```json
{
  "id": "uuid-da-solicitacao",
  "username": "Nome do solicitante",
  "email": "usuario@exemplo.com",
  "access_profile": "aluno"
}
```

### PUT `/api/requests/bind/<request_id>/approve/`
Aprova a solicitacao somente se ela estiver relacionada aos dados pessoais da
conta autenticada. Associa esses dados ao usuario solicitante e remove a
solicitacao. Nao altera nem ativa a conta solicitante.

### DELETE `/api/requests/bind/<request_id>/reject/`
Rejeita a solicitacao somente se ela estiver relacionada aos dados pessoais da
conta autenticada. Remove a solicitacao, desvincula os dados pessoais e de
conta do solicitante e restaura `first_login` para que ele preencha os dados
novamente. Um registro de dados de conta compartilhado com outros usuarios
nao e removido.

## POST `personal_account_infos/create/`
Cria ou associa os dados pessoais e os dados da conta de um usuario em uma
requisicao. Ambos os objetos aninhados sao obrigatorios e validados antes da
gravacao, que ocorre em uma transacao atomica.

Permissoes: `add_personalinfos` e `add_accountinfos`

Body:
```json
{
  "user": "uuid-do-usuario",
  "personal_infos": {
    "cpf": "52998224725",
    "birth_date": "1990-01-15"
  },
  "account_infos": {
    "telephone_number": "11912345678",
    "registration": "1234567"
  }
}
```

O campo `user` e o UUID de `User`. Os objetos `personal_infos` e
`account_infos` representam os modelos correspondentes:

- `PersonalInfos`: `id` (UUID), `cpf` (unico, ate 11 caracteres) e `birth_date`
  (data).
- `AccountInfos`: `id` (UUID), `registration` (unica, anulavel, ate 11
  caracteres) e `telephone_number` (ate 13 caracteres).

`User.personal_infos` e `User.account_infos` sao FKs anulaveis com
`on_delete=SET_NULL`; cada registro pode ser referenciado por mais de um
usuario. O modelo `Password` e independente e se relaciona com `User` por
`OneToOneField`.

Se o CPF ja estiver cadastrado com a mesma data de nascimento, o sistema cria
uma solicitacao `BindRequest` e nao vincula imediatamente os dados pessoais ao
usuario. Solicitacoes repetidas para o mesmo usuario e registro pessoal sao
deduplicadas. Se CPF e data de nascimento forem inconsistentes com o registro
existente, a validacao falha.

Validacoes de `PersonalInfos`:

- `cpf` deve conter 11 digitos e passar na validacao de CPF.
- A idade calculada a partir de `birth_date` deve estar entre 14 e 100 anos.
- Contas do tipo Departamento (`is_abstract: true`) nao podem ter estes dados
  associados.

Validacoes de `AccountInfos`:

- `telephone_number` deve conter DDD e numero (8 ou 9 digitos) ou estar no
  formato `+55` seguido de DDD e numero.
- `registration` e opcional para os demais grupos, mas obrigatorio para usuarios
  nos grupos `aluno` ou `servidor`.
- Para o grupo `aluno`, a matricula pode ter no maximo 10 caracteres; para o
  grupo `servidor`, a matricula SIAPE deve conter exatamente 7 digitos.
- A matricula e unica. Se ja existir, o telefone informado deve corresponder
  ao telefone associado a ela.

O endpoint reutiliza registros existentes: dados pessoais sao localizados por
CPF e dados da conta por matricula. Sem matricula, procura-se um registro sem
matricula pelo telefone. O usuario autenticado so pode cadastrar os proprios
dados; o grupo `admin` pode cadastrar para outro usuario. Credenciais de sistema
nao podem ser usadas para esta operacao.

Se o cadastro for feito pelo proprio usuario autenticado, `first_login` passa
a `false`.

## GET `personal_account_infos/get/<user_id>/`
Retorna os objetos `personal_infos` e `account_infos` associados ao usuario,
mantendo-os aninhados. Se nenhum dos dois estiver associado, retorna `404`.

Query params:
- `fields` (obrigatorio). Use nomes qualificados para selecionar campos dos
  dois objetos, por exemplo:
  `personal_infos.id,personal_infos.cpf,personal_infos.birth_date,account_infos.id,account_infos.registration,account_infos.telephone_number`.

Permissoes: `view_personalinfos` e `view_accountinfos`. Alem dessas permissoes,
o usuario autenticado so pode consultar dados vinculados aos seus proprios
registros pessoais e de conta. Membros do grupo `admin` podem consultar dados
de qualquer usuario.

Exemplo de resposta para a selecao de campos acima:
```json
{
  "personal_infos": {
    "id": "uuid-dos-dados-pessoais",
    "cpf": "52998224725",
    "birth_date": "1990-01-15"
  },
  "account_infos": {
    "id": "uuid-dos-dados-da-conta",
    "registration": "1234567",
    "telephone_number": "11912345678"
  }
}
```

## PUT `personal_account_infos/edit/<user_id>/`
Atualiza os dados pessoais e da conta do usuario. O corpo deve conter os
objetos `personal_infos` e `account_infos` no mesmo formato aninhado do POST,
alem de `user` com o mesmo UUID indicado na URL. `telephone_number` e
obrigatorio. `registration` pode ser omitido para usuarios fora dos grupos
`aluno` e `servidor`; nesses casos, sua omissao remove a matricula existente.
Para `aluno` e `servidor`, a matricula continua obrigatoria. CPF e data de
nascimento podem ser omitidos quando ja existem dados pessoais vinculados ou
uma solicitacao `BindRequest` pendente.

Usuarios autenticados podem alterar somente os proprios dados; membros de
`admin` podem alterar dados de qualquer usuario. Credenciais de sistema nao
podem editar estes dados.

Como os registros podem ser compartilhados, atualizar um registro existente
tambem altera os dados vistos pelos outros usuarios associados a ele. Se o CPF
informado pertencer a outro registro e a data de nascimento corresponder, cria
uma `BindRequest` em vez de associar esse registro automaticamente; os dados
pessoais do solicitante ficam sem vinculo ate a aprovacao.

---

# Grupos

Base: `/api/groups/`

## POST `create/`
Cria grupo e adiciona permissoes.

Permissao: `add_group`

Body:
```json
{
  "name": "nome do grupo",
  "permissionsToAdd": [
    { "id": "uuid-da-permissao" }
  ]
}
```

Observacao:
- O nome e normalizado (minusculo, sem acento, espacos viram `_`).
- `permissionsToAdd` usa UUID do `PermissionUUIDMap`.

## GET `get/`
Lista grupos.

Query params:
- `fields` (obrigatorio)
- `search` (opcional)
- `page`, `page_size` (opcional)

Permissao: `view_group`

## GET `get/<group_id>/`
Detalha grupo.

Query params:
- `fields` (obrigatorio)

Permissao: `view_group`

## GET `get/available/<user_id>/`
Lista grupos ainda nao atribuidos ao usuario.

Query params:
- `fields` (obrigatorio)
- `page`, `page_size` (opcional)

Permissao: `view_group`

## PUT/PATCH `edit/<group_id>/`
Edita nome e permissoes.

Permissao: `change_group`

Body:
```json
{
  "name": "novo_nome",
  "permissionsToAdd": [{ "id": "uuid-da-permissao" }],
  "permissionsToRemove": [{ "id": "uuid-da-permissao" }]
}
```

---

# Permissoes

Base: `/api/permissions/`

## GET `get/`
Lista todas as permissoes.

Query params:
- `fields` (obrigatorio)
- `page`, `page_size` (opcional)

Permissao: `view_permission`

## GET `get/<group_id>/`
Lista permissoes atribuidas ao grupo.

Query params:
- `fields` (obrigatorio)
- `page`, `page_size` (opcional)

Permissao: `view_permission`

## GET `get/<group_id>/not_assigned/`
Lista permissoes nao atribuidas ao grupo.

Query params:
- `fields` (obrigatorio)
- `page`, `page_size` (opcional)

Permissao: `view_permission` e `view_group`

---

# Sistemas

Base: `/api/systems/`

## POST `create/`
Cria sistema.

Permissoes: `add_system`, `add_group`

Body:
```json
{
  "name": "Nome do sistema",
  "system_url": "https://...",
  "is_active": true,
  "current_state": "Em desenvolvimento|Implantado",
  "secret_key": "chave-secreta",
  "dev_team": ["uuid-usuario", "uuid-usuario"]
}
```

Observacao:
- `api_key` e gerado automaticamente.
- `dev_team` aceita apenas usuarios ativos com perfil `aluno`.

## GET `get/`
Lista sistemas.

Query params:
- `fields` (obrigatorio)
- `page`, `page_size` (opcional)

Permissao: `view_system`

## GET `get/<system_id>/`
Detalha sistema.

Query params:
- `fields` (obrigatorio)

Permissao: `view_system`

## GET `get_url/<system_id>/`
Retorna a URL do sistema.

Resposta:
```json
{ "system_url": "https://..." }
```

## GET `validate/<api_key>/`
Valida se a chave pertence a um sistema.

Resposta:
```json
{ "message": "Sistema valido" }
```

## PUT `edit/<system_id>/`
Edita sistema.

Permissoes: `change_system`, `add_group`

Body: mesmo formato do create.

Notas sobre `api_key` e `secret_key`:
- Se o campo `api_key` ou `secret_key` for pedido em `fields`,
  ele so e retornado quando:
  - usuario e admin, ou
  - usuario esta no `dev_team` e o sistema esta `Em desenvolvimento`.

---

# Calendarios

Base: `/api/calendars/`

## POST `create/`
Cria calendario.

Permissao: `add_calendar`

Body:
```json
{
  "title": "2025/1",
  "start": "YYYY-MM-DD",
  "end": "YYYY-MM-DD",
  "status": "Ativo|Suspenso|Cancelado"
}
```

## GET `get/`
Lista calendarios.

Query params:
- `fields` (obrigatorio)
- `search` (opcional)
- `status` (opcional)
- `page`, `page_size` (opcional)

Permissao: `view_calendar`

## GET `get/<calendar_id>/`
Detalha calendario.

Query params:
- `fields` (obrigatorio)

Permissao: `view_calendar`

## PUT/PATCH `edit/<calendar_id>/`
Edita calendario.

Permissao: `change_calendar`

---

# Eventos

Base: `/api/calendars/events/`

## POST `create/`
Cria evento.

Permissao: `add_event`

Body:
```json
{
  "title": "Nome do evento",
  "start": "YYYY-MM-DD",
  "end": "YYYY-MM-DD",
  "type": "Semana Pedagógica|Feriados e dias não letivos|...",
  "category": "Integrado|ProEJA|Geral",
  "description": "opcional",
  "calendar": "uuid-do-calendario"
}
```

## GET `get/`
Lista eventos por mes.

Query params (obrigatorios):
- `month` (1-12)
- `year` (YYYY)
- `fields` (obrigatorio)

Permissao: `view_event`

## GET `get/<event_id>/`
Detalha evento.

Query params:
- `fields` (obrigatorio)

Permissao: `view_event`

## PUT/PATCH `edit/<event_id>/`
Edita evento.

Permissao: `change_event`

---

# Academico

Base: `/api/academic/`

## Cursos

### POST `courses/create/`
Cria curso.

Permissoes: `add_course`, `add_courseclass`

Body:
```json
{
  "name": "Nome do curso",
  "workload": 1200,
  "category": "Técnico Subsequente ao Ensino Médio|Técnico Integrado ao Ensino Médio|Educação de Jovens e Adultos (ProEJA)|Especialização|Superior",
  "coord": "uuid-do-usuario",
  "classes": [
    { "number": "101" }
  ]
}
```

Regra:
- Para categorias ligadas ao Ensino Medio, `classes` e obrigatorio.

### GET `courses/get/`
Lista cursos.

Query params:
- `fields` (obrigatorio)
- `search` (opcional)
- `category` (opcional)
- `page`, `page_size` (opcional)

Permissoes: `view_course`, `view_courseclass`

### GET `courses/get/<course_id>/`
Detalha curso.

Query params:
- `fields` (obrigatorio)

Permissoes: `view_course`, `view_courseclass`

### PUT/PATCH `courses/edit/<course_id>/`
Edita curso.

Permissoes: `change_course`, `change_courseclass`

Body: mesmo formato do create, com `classes` podendo incluir itens com `id`:
```json
{
  "name": "Nome",
  "workload": 1200,
  "category": "Superior",
  "coord": "uuid-do-usuario",
  "classes": [
    { "id": "uuid-da-turma", "number": "201" },
    { "number": "202" }
  ]
}
```

### DELETE `courses/classes/delete/<class_id>/`
Remove uma turma.

Permissao: `delete_courseclass`

## Disciplinas

### POST `subjects/create/`
Cria disciplina.

Permissao: `add_subject`

Body:
```json
{
  "name": "Disciplina",
  "code": "INF001",
  "objective": "Texto",
  "menu": "Texto"
}
```

### GET `subjects/get/`
Lista disciplinas.

Query params:
- `fields` (obrigatorio)
- `search` (opcional)
- `page`, `page_size` (opcional)

Permissao: `view_subject`

### GET `subjects/get/<subject_id>/`
Detalha disciplina.

Query params:
- `fields` (obrigatorio)

Permissao: `view_subject`

### GET `courses/get/<course_id>/subjects/`
Lista disciplinas de um curso (via PPC).

Query params:
- `fields` (obrigatorio)
- `search` (opcional)
- `page`, `page_size` (opcional)

Permissao: `view_subject`

### PUT/PATCH `subjects/edit/<subject_id>/`
Edita disciplina.

Permissao: `change_subject`

## PPC (Projeto Pedagogico de Curso)

### POST `ppcs/create/`
Cria PPC.

Permissao: `add_ppc`

Body (JSON):
```json
{
  "title": "PPC 2025",
  "course": "uuid-do-curso",
  "curriculum": [
    {
      "subject": "uuid-da-disciplina",
      "period": 1,
      "weekly_periods": 4,
      "subject_teach_workload": 60,
      "subject_ext_workload": 0,
      "subject_remote_workload": 0,
      "pre_requisits": ["uuid-disciplina"]
    }
  ]
}
```

Body (multipart/form-data):
- `title`
- `course`
- `curriculum` (arquivo PDF) **opcional**: se enviado, o backend tenta extrair a grade do PDF.

### GET `ppcs/get/`
Lista PPCs.

Query params:
- `fields` (obrigatorio)
- `search` (opcional)
- `page`, `page_size` (opcional)

Permissoes: `view_ppc`, `view_subject`, `view_course`

### GET `ppcs/get/<ppc_id>/`
Detalha PPC.

Query params:
- `fields` (obrigatorio)

Permissoes: `view_ppc`, `view_subject`, `view_course`

### PUT/PATCH `ppcs/edit/<ppc_id>/`
Edita PPC.

Permissao: `change_ppc`

Body: mesmo formato do create.

### DELETE `ppcs/delete/<ppc_id>/period/<period>/`
Remove todas as disciplinas de um periodo.

Permissoes: `delete_curriculum`, `change_ppc`

### DELETE `ppcs/delete/<ppc_id>/subjects/<subject_id>/`
Remove disciplina do PPC.

Permissoes: `delete_curriculum`, `change_ppc`

### DELETE `ppcs/delete/<ppc_id>/subjects/<subject_id>/pre_reqs/<pre_req_id>/`
Remove um pre-requisito da disciplina no PPC.

Permissoes: `delete_curriculum`, `change_ppc`

---

# Campos e enums

## Access profile
`aluno`, `servidor`, `convidado`

## Categoria (usuarios/eventos)
`Integrado`, `ProEJA`, `Geral`

## Status de calendario
`Ativo`, `Suspenso`, `Cancelado`

## Tipos de evento
`Semana Pedagógica`, `Feriados e dias não letivos`, `Prazo final para registro de notas e entrega de documentos`,
`Dias letivos`, `Recesso Escolar/Férias`, `Exames`, `Conselhos de classe`, `Vestibular`, `Fim de etapa`

## Categoria de curso
`Técnico Subsequente ao Ensino Médio`, `Técnico Integrado ao Ensino Médio`,
`Educação de Jovens e Adultos (ProEJA)`, `Especialização`, `Superior`

## Estado do sistema
`Em desenvolvimento`, `Implantado`
