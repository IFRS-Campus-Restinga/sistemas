# Fluxo de login — Convidado

## Formas de autenticação

O convidado pode autenticar-se com uma conta Google ou criar uma conta local
com email e senha. Nos dois casos, uma conta nova aguarda aprovação
administrativa antes de receber acesso ao sistema.

## Login com Google

1. O usuário escolhe o perfil **Convidado** e autentica-se com o Google usando
   o Client ID configurado para a aplicação.
2. O backend valida a credencial Google e verifica se o email já está
   registrado para outro perfil ou método de autenticação.
3. Se for uma nova conta, o sistema:
   - define `access_profile = convidado`;
   - cria uma `AccessRequest`;
   - mantém a conta inativa até a aprovação.
4. A solicitação aparece como acesso pendente; não é emitida uma sessão
   autenticada.
5. Um administrador seleciona os grupos e aprova ou rejeita a solicitação.
   Convidados não podem receber o grupo `coord`.
6. Ao aprovar, o sistema ativa a conta, define `is_abstract = false` e remove
   a solicitação.
7. Ao rejeitar, o sistema remove a solicitação e exclui a conta associada.

## Cadastro e login com email e senha

1. O usuário informa nome, sobrenome, email e senha no formulário de cadastro.
2. O sistema cria a conta com `access_profile = convidado`, associa uma senha
   e cria uma `AccessRequest`.
3. A conta começa inativa e com `email_verified = false`. É criada uma
   confirmação de email com código de seis dígitos, válido por 10 minutos.
4. O usuário confirma o email antes que o administrador possa aprovar a
   solicitação. O código é apresentado ao responsável pelo sistema porque o
   envio de email ainda não está configurado.
5. A confirmação do email não ativa a conta: ela continua pendente até a
   aprovação administrativa.
6. Depois da aprovação, o convidado pode entrar usando o email e a senha
   cadastrados.
7. Enquanto a conta estiver inativa, o login por senha é recusado.

## Contas existentes e restrições

- O perfil selecionado no login Google deve coincidir com o `access_profile`
  cadastrado.
- Uma conta com senha não pode autenticar-se pelo fluxo Google; uma conta sem
  senha não pode autenticar-se pelo fluxo de email e senha.
- O administrador não pode aprovar um convidado não confirmado por email.
- Contas de convidado são sempre do tipo pessoal (`is_abstract = false`).
