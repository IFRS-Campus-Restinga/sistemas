# Cadastro de sistemas e uso da chave de API

Este documento descreve o cadastro, a consulta de detalhes e o uso da chave de
API de sistemas vinculados ao Hub. O comportamento do middleware é baseado na
versão `v0.2.0` de `FS_auth_middleware`, fixada em
`backend/requirements.txt`.

## 1. Cadastro de um sistema

O cadastro é iniciado pela opção **Novo Sistema** na tela de sistemas. O
usuário precisa ter a permissão `add_system`; o endpoint de criação também
exige `add_group`.

O formulário coleta:

- nome do sistema (até 50 caracteres);
- URL/domínio do sistema;
- `SECRET_KEY` já configurada no projeto do sistema;
- estado atual: **Em desenvolvimento** ou **Implantado**;
- estado: **Ativo** ou **Inativo**;
- equipe de desenvolvimento composta por alunos.

O frontend procura usuários pelo perfil de acesso `aluno` e permite adicioná-
los à equipe. O cadastro e a edição exigem pelo menos um aluno na equipe; o
frontend bloqueia o envio se a equipe estiver vazia, e o backend repete a
validação para também proteger chamadas diretas à API. O backend só permite
associar alunos ativos.

Após validar o payload, o backend cria o registro `System` e gera
automaticamente a chave de API com `secrets.token_hex(32)`, produzindo 64
caracteres hexadecimais aleatórios. Não se deve enviar nem escolher a chave de
API pelo formulário. O nome do sistema é único.

O backend também valida os campos e tipos. Por exemplo, `name` é único,
`system_url` precisa ser uma URL válida, e os integrantes de `dev_team` devem
corresponder aos usuários permitidos pelo serializer.

## 2. Consulta de detalhes e obtenção da chave

O sistema cadastrado aparece na lista do frontend. Os administradores podem
abrir seus detalhes; um usuário não administrador só vê as ações de detalhes
quando faz parte da equipe de desenvolvimento e o sistema está **Em
desenvolvimento**.

Ao abrir os detalhes, o frontend solicita `api_key` pelo endpoint:

```text
GET /api/systems/get/<system_id>/?fields=api_key
```

O endpoint exige `view_system`. O backend inclui a chave na resposta para
administradores; para outros usuários, só a inclui se o usuário fizer parte
de `dev_team` e o sistema estiver **Em desenvolvimento**. A chave é mostrada
na interface junto ao ID do sistema.

O campo `secret_key` é diferente da chave de API: é informado no cadastro a
partir da configuração do sistema vinculado, e é usado pelo fluxo de
autenticação/token do projeto. Não trate `secret_key` e `api_key` como
intercambiáveis. A chave de API é gerada pelo Hub e usada pelo middleware para
reconhecer requisições de sistema.

No serializer, a chave é gerada no `create()`. A edição atualiza o registro
existente sem gerar uma nova chave automaticamente.

## 3. Uso da chave pelo `FS_auth_middleware`

O Hub configura `FS_AUTH_SYSTEM_MODEL = "hub_systems.System"`. O middleware
`FS_auth_middleware` v0.2.0 usa esse model para validar a credencial de sistema
e espera os campos `id`, `name`, `system_url`, `is_active`, `api_key`,
`current_state`, `secret_key` e `dev_team`.

Em endpoints protegidos pelo decorator `@has_permissions([...])`, o fluxo do
middleware é:

1. Se o cookie de acesso de usuário configurado em `AUTH_COOKIE_NAME` estiver
   presente, o middleware segue o fluxo de JWT de usuário; o cookie `system`
   não substitui esse JWT.
2. Sem cookie de acesso de usuário, o middleware procura a credencial no
   cookie chamado literalmente `system`.
3. Se não houver esse cookie, a resposta é `401`.
4. Se houver cookie, o middleware verifica se seu valor corresponde ao campo
   `api_key` de um registro do model configurado.
5. Credenciais de sistema só podem chamar métodos HTTP `GET`; outros métodos
   recebem `405`.
6. Um `GET` com chave válida segue para a view decorada.

Uma integração servidor a servidor deve, portanto, enviar a chave de API no
cookie HTTP `system` ao fazer um `GET` para um endpoint do Hub protegido por
`@has_permissions`. Por exemplo, conceitualmente:

```http
GET /api/algum-recurso/ HTTP/1.1
Host: hub.exemplo.edu
Cookie: system=<chave-de-api>
```

Não envie uma chave real em documentação, código público, repositório ou
frontend. Trate-a como credencial secreta do servidor vinculado.

## 4. Limites de autorização do middleware atual

Na versão `v0.2.0` fixada pelo backend, a verificação da credencial de sistema
confere a existência da chave na tabela `System`. O caminho de autenticação
por sistema não verifica `is_active`, `current_state`, `dev_team` ou as
permissões exigidas no argumento de `@has_permissions`. Uma chave válida
permite passar por qualquer view decorada que aceite `GET`, inclusive quando
o sistema está inativo ou implantado.

Isso difere das regras da interface para exibir os detalhes da chave: a
restrição de integrante da equipe e estado **Em desenvolvimento** existe na
apresentação do `api_key` pelo Hub, mas não é revalidada pelo middleware ao
receber a chave. Portanto, marcar um sistema como inativo ou implantado, ou
removê-lo da equipe, não invalida por si só a chave para os `GET` protegidos.
Essa limitação deve ser considerada antes de tratar o estado da interface
como mecanismo de revogação ou autorização da API.

O endpoint de validação do Hub
`GET /api/systems/validate/<api_key>/` também verifica somente se a chave
existe e retorna **Sistema válido** ou **Sistema não encontrado**; ele não
verifica o estado ativo do sistema.

## 5. Recomendações operacionais

- Compartilhe a chave de API somente com o backend do sistema vinculado e
  armazene-a em configuração secreta do servidor.
- Não coloque a chave em código frontend, JavaScript entregue ao navegador,
  URLs, logs ou repositórios.
- Considere qualquer exposição como comprometimento da credencial. A versão
  atual não fornece rotação automática: a edição do cadastro não gera uma
  chave nova.
- Não use a chave de API como autorização de usuário final. No middleware
  atual, ela autentica o chamador servidor a servidor para requisições `GET`,
  sem aplicar as permissões do usuário.
- Para restringir requisições por estado, equipe e permissões, será necessário
  ajustar o middleware/contrato de autenticação; a configuração de
  `is_active` na tela, isoladamente, não revoga o acesso dessa credencial.
