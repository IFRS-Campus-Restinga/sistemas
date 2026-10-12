# Fluxo de informações da conta

Este documento descreve os dados de conta (`AccountInfos`): telefone e
matrícula. Eles são armazenados separadamente dos dados pessoais e podem ser
compartilhados entre contas.

## Preenchimento e validação

1. No fluxo de primeiro preenchimento, o usuário envia telefone e matrícula
   junto ao CPF e à data de nascimento.
2. Em erros de validação de dados pessoais ou de conta, a API retorna somente
   a mensagem genérica `Ocorreu um erro`, sem informar se um CPF, telefone ou
   matrícula já está cadastrado.
3. O backend valida telefone e matrícula antes de persistir as informações.
   O telefone deve conter DDD e número, nos formatos aceitos pelo backend
   (`(DD)NNNNNNNN`, `(DD)NNNNNNNNN`, `DDNNNNNNNN`, `DDNNNNNNNNN` ou
   `+55` seguido de 11 dígitos).
4. O campo matrícula aceita até 11 caracteres no serializer. Quando a conta
   possui o grupo `aluno`, é obrigatório e pode ter até 10 caracteres.
   Quando possui o grupo `servidor`, é obrigatório e deve conter 7 dígitos.
   Essas validações consultam os grupos associados, não apenas
   `access_profile`.
5. Matrícula já registrada com outro telefone é recusada. Quando a matrícula
   existente tem o mesmo telefone, o backend reutiliza o registro
   `AccountInfos`; caso contrário, cria um novo registro.
6. Sem matrícula, a criação pode reutilizar um registro sem matrícula que
   tenha o mesmo telefone; se não houver, cria um registro.

## Relação com solicitação de vínculo pessoal

- Se o CPF informado não existir, os dados pessoais e os dados de conta são
  criados/obtidos e associados à conta.
- Se o CPF existente tiver a mesma data de nascimento, é criada uma
  `BindRequest` para aprovação do vínculo pessoal. Enquanto ela estiver
  pendente, os dados de conta já ficam associados à conta solicitante, embora
  os dados pessoais ainda não estejam.
- Na aprovação, os dados pessoais existentes são associados; os dados de
  conta já associados permanecem.
- Na rejeição, os vínculos pessoal e de conta do solicitante são removidos.
  O objeto `AccountInfos` só é apagado se não houver outra conta usando-o; se
  for removido, o usuário deve preencher novamente os dados no próximo acesso.
- Um CPF existente com data de nascimento divergente não abre solicitação: o
  backend rejeita o envio durante a validação.

## Edição

Ao editar informações de uma conta, o backend atualiza os dados de conta
associados ou cria um registro `AccountInfos` se a conta ainda não tiver um.
Se a edição indicar um CPF já vinculado a outro registro pessoal e a data de
nascimento coincidir, é aberta uma `BindRequest`; o vínculo pessoal fica
pendente da aprovação. A validação de matrícula e telefone também se aplica à
edição.
