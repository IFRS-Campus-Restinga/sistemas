# Fluxo de informações pessoais

Este documento descreve o comportamento implementado para os dados pessoais
(`PersonalInfos`), composto por CPF e data de nascimento, e seu vínculo com
contas de usuário.

## Primeiro preenchimento

1. No primeiro acesso, quando a conta está em `first_login = true`, a interface
   solicita os dados pessoais e os dados da conta.
2. O backend valida todos os dados antes de persistir qualquer objeto.
3. O CPF deve ter 11 dígitos numéricos e passar pela validação dos dígitos
   verificadores. A data de nascimento deve indicar idade entre 14 e 100 anos.
4. Se não houver `PersonalInfos` para o CPF, o backend cria o registro com CPF
   e data de nascimento.
5. O backend também obtém ou cria o registro `AccountInfos` e associa os dados
   à conta. A associação do registro pessoal e da conta é feita na mesma
   operação transacional.
6. Quando a requisição é feita pela própria conta autenticada, o backend
   define `first_login = false`.

## CPF já cadastrado

- Se o CPF já existir e a data de nascimento coincidir, o backend cria uma
  `BindRequest` para as informações pessoais existentes. A conta solicitante
  ainda não recebe o vínculo em `personal_infos`.
- Uma conta autenticada que já esteja vinculada àquelas mesmas informações
  pessoais pode listar, aprovar ou rejeitar a solicitação. As operações ficam
  limitadas às solicitações do registro pessoal da conta autenticada; não são
  restritas exclusivamente a administradores.
- Ao aprovar, o backend associa as informações pessoais existentes à conta
  solicitante e remove a `BindRequest`.
- Ao rejeitar, remove a solicitação, desvincula da conta solicitante tanto
  `personal_infos` quanto `account_infos` e define `first_login = true`.
  A conta de usuário não é excluída.
- Os dados de conta desvinculados são apagados somente se nenhum outro usuário
  ainda os utilizar. Assim, dados compartilhados por outra conta são
  preservados.

## Validações e limites observados

- Em erros ao criar, consultar ou editar dados pessoais e de conta, e ao
  processar solicitações de vínculo, a API retorna a mensagem genérica
  `Ocorreu um erro`; detalhes da validação ou da existência de dados não são
  enviados ao cliente.
- Se o CPF existir, mas a data de nascimento informada não corresponder à
  registrada, o preenchimento é recusado com erro de validação; não é aberta
  uma solicitação de vínculo.
- O endpoint de criação não verifica que `first_login` seja `true`; a
  interface o utiliza para direcionar o primeiro preenchimento, mas essa
  condição não é imposta pelo serviço de criação.
- Quando há solicitação pendente, `account_infos` já fica associado à conta.
  `first_login` também é definido como `false` pela criação autenticada, mesmo
  sem `personal_infos`; a interface identifica a espera pelo vínculo pendente
  e pela ausência dos dados pessoais. Se houver rejeição, o serviço de rejeição
  restaura `first_login = true`.
- A rotina de criação reutiliza `AccountInfos` quando encontra a mesma
  matrícula com telefone compatível; sem matrícula, pode reutilizar um registro
  sem matrícula com o mesmo telefone. Portanto, nem sempre cria um novo
  objeto de informações da conta.
