# Fluxo de login — Aluno

## Regra de negócio

O aluno autentica-se com uma conta Google institucional. Quando a conta ainda
não existe, o sistema cria e ativa a conta automaticamente, sem aguardar
aprovação administrativa.

## Fluxo

1. O usuário escolhe o perfil **Aluno** na tela de login.
2. Autentica-se com o Google usando o Client ID configurado para a aplicação.
3. O backend valida a credencial Google e verifica se o email já está
   registrado para outro perfil.
4. Se for uma nova conta, o sistema:
   - define `access_profile = aluno`;
   - associa a conta ao grupo `user`;
   - mantém `is_abstract = false` (conta pessoal);
   - define `is_active = true` automaticamente;
   - não cria uma `AccessRequest`.
5. O backend retorna os dados da conta e emite os cookies de autenticação.
6. Se for o primeiro login e ainda não houver dados pessoais ou dados da
   conta, o usuário é encaminhado ao formulário de primeiro acesso.

## Contas existentes

- O perfil selecionado no login deve coincidir com o `access_profile` já
  cadastrado.
- Contas criadas por outro método de autenticação não podem entrar com Google.
- Se a conta estiver inativa, o login não é concluído; a ativação não é
  repetida automaticamente para uma conta existente.

## Observação sobre email institucional

A credencial Google é validada com o Client ID configurado, mas o backend não
confere se o domínio do email pertence à instituição. Portanto, a exigência de
email institucional é uma regra operacional que precisa ser garantida pela
configuração OAuth ou implementada como validação adicional no backend.
