# Fluxo de login — Servidor

## Regra de negócio

O servidor autentica-se com uma conta Google institucional. A primeira
autenticação registra a conta como pendente; um administrador precisa aprová-la
antes que o servidor possa entrar no sistema.

## Fluxo

1. O usuário escolhe o perfil **Servidor** na tela de login.
2. Autentica-se com o Google usando o Client ID configurado para a aplicação.
3. O backend valida a credencial Google e verifica se o email já está
   registrado para outro perfil.
4. Se for uma nova conta, o sistema:
   - define `access_profile = servidor`;
   - cria uma `AccessRequest`;
   - mantém a conta inativa até a aprovação administrativa.
5. A solicitação é apresentada como acesso pendente. Nenhum cookie de sessão
   autenticada é emitido para a conta ainda não aprovada.
6. Um administrador seleciona os grupos da conta e aprova ou rejeita a
   solicitação.
7. Ao aprovar, o sistema ativa a conta, salva os grupos escolhidos e remove a
   `AccessRequest`. O tipo pessoal/departamento é definido na aprovação.
8. Ao rejeitar, o sistema remove a `AccessRequest` e exclui a conta associada.

## Contas existentes

- O perfil selecionado no login deve coincidir com o `access_profile` já
  cadastrado.
- Contas criadas por outro método de autenticação não podem entrar com Google.
- Enquanto `is_active` for falso, uma conta já cadastrada não pode concluir o
  login.

## Observação sobre email institucional

A credencial Google é validada com o Client ID configurado, mas o backend não
confere se o domínio do email pertence à instituição. Portanto, a exigência de
email institucional é uma regra operacional que precisa ser garantida pela
configuração OAuth ou implementada como validação adicional no backend.
