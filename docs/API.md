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
- `refresh_token`: expira em 7 dias (ou 1 dia quando gerado via `pair-token`).

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

## GET `/session/token/pair-token/`
Gera um par de tokens para um usuario especifico.

Query params:
- `user`: UUID do usuario

Resposta `200`:
```json
{ "access": "<jwt>", "refresh": "<jwt>" }
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
Cria conta de visitante (ou aluno, se via Google).

Body:
```json
{
  "email": "user@email.com",
  "first_name": "Nome",
  "last_name": "Sobrenome",
  "accessProfile": "convidado|aluno|servidor",
  "password": "opcional (apenas para convidado)"
}
```

Resposta `201`:
```json
{ "message": "Conta criada com sucesso" }
```

## GET `get/data/`
Retorna dados do usuario da sessao (cookie `access_token`).

Query params:
- `fields` (obrigatorio)

Permissao: `view_customuser`

## GET `get/<user_id>/`
Retorna dados do usuario.

Query params:
- `fields` (obrigatorio)

Permissao: `view_customuser`

## GET `get/group/<group_name>/`
Lista usuarios por grupo.

Query params:
- `fields` (obrigatorio)
- `search` (opcional)
- `status` (opcional): `Ativo` ou `Inativo`
- `page`, `page_size` (opcional)

Permissao: `view_customuser`

## GET `get/access_profile/<access_profile_name>/`
Lista usuarios por perfil (`aluno`, `servidor`, `convidado`).

Query params:
- `fields` (obrigatorio)
- `search` (opcional)
- `status` (opcional): `Ativo` ou `Inativo`
- `page`, `page_size` (opcional)

Permissao: `view_customuser`

## PUT `edit/<user_id>/`
Edita usuario.

Permissao: `change_customuser`

Body (exemplo):
```json
{
  "username": "Nome Completo",
  "email": "user@email.com",
  "access_profile": "aluno|servidor|convidado",
  "groups": [
    { "id": "uuid-do-grupo" }
  ],
  "is_active": true,
  "is_abstract": false
}
```

Observacao:
- `groups[].id` deve ser o UUID do `GroupUUIDMap`.
- Regras: admin nao pode ser combinado com user; convidado nao pode ter coord.

## GET `request/get/`
Lista requisicoes de acesso pendentes (usuarios com `first_login=true`).

Query params:
- `fields` (obrigatorio)
- `page`, `page_size` (opcional)

Permissao: `view_customuser`

## PUT `request/<user_id>/approve/`
Aprova requisicao de acesso.

Permissao: `change_customuser`

Body:
```json
{
  "groups": [
    { "id": "uuid-do-grupo" }
  ],
  "is_abstract": false
}
```

## DELETE `request/<user_id>/decline/`
Recusa requisicao e remove o usuario.

Permissao: `delete_customuser`

## POST `additional_infos/create/`
Cria informacoes adicionais do usuario.

Permissao: `add_additionalinfos`

Body:
```json
{
  "birth_date": "YYYY-MM-DD",
  "telephone_number": "DDDNnnnnnnnn",
  "registration": "opcional",
  "cpf": "11 digitos",
  "user": "uuid-do-usuario"
}
```

Regras:
- CPF precisa ser valido.
- Idade: 14 a 100 anos.
- `registration` obrigatorio para `aluno` e `servidor`.
- Apenas admin ou o proprio usuario podem criar.

## GET `additional_infos/get/<user_id>/`
Retorna informacoes adicionais.

Query params:
- `fields` (obrigatorio)

Permissao: `view_additionalinfos`

## PUT `additional_infos/edit/<user_id>/`
Edita informacoes adicionais.

Permissao: `change_additionalinfos`

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
