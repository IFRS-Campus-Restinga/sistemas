# Hub de sistemmas do IFRS

# Para integrar seu sistema, siga o passo-a-passo abaixo

# 1) Crie um projeto Django com o comando django-admin startproject "nome_do_projeto"
# 2) Solicite a um administrador que cadastre seu projeto no Hub atravé do formulário de sistemas

<img width="1918" height="907" alt="Captura de tela 2025-07-19 133552" src="https://github.com/user-attachments/assets/e6dfc79f-9cae-41d8-b6e4-b6b83b5660bc" />

# OBS: Preencha o campo de URL do sistema com http://localhost:3000.
# OBS 2: a chave secreta deve ser a mesma do seu projeto django, pois é com ela que os tokens de autenticaçãao serão assinados ao redirecionar o usuário para seu sistema.

# 3) Variáveis de ambiente:
# a) Django Settings:
  # - SYSTEM_ID: Que corresponderá ao id do sistema cadastrado no Hub;
  # - BASE_SYSTEM_URL: Que corresponde a URL base do Hub.
# b) React App:
  # REACT_APP_BASE_SYSTEM_URL: Corresponderá a URL base do Hub;

# 4) No frontend de seu projeto, defina a rota da página de login como http://localhost:3000/session/token/

# OBS: A página de login deve possuir apenas um componente de carregamento, pois a validação dos dados do usuário será feita pelo próprio sistema.

# 5) No componente da página de login, extraia o ID do sistema, o ID do usuário e opcionalmente o source da foto de perfil, que serão recebidos conforme o modelo abaixo:

# EX: "http://localhost:3000/session/token/?system=id-ficticio-do-sistema&user=id-ficticio-do-usuario&profilePicture=https://link-ficticio-da-foto-do-usuario"

# 6) Funções para lidar com autenticação pós-redirecionamento (os nomes podem ser alterados):
# Frontend
<img width="632" height="731" alt="image" src="https://github.com/user-attachments/assets/c6251b95-21f1-4051-a400-e7ba66c62c26" />
<img width="545" height="759" alt="image" src="https://github.com/user-attachments/assets/324a053d-885b-4606-aa7b-265f6c68fdc7" />
<img width="438" height="375" alt="image" src="https://github.com/user-attachments/assets/f7b0ddc2-41c6-4f9f-ac85-515dfe80d1b3" />


# Backend
<img width="1086" height="542" alt="image" src="https://github.com/user-attachments/assets/5962ae58-68b2-44ab-a8cb-db75862bb929" />
<img width="679" height="463" alt="image" src="https://github.com/user-attachments/assets/8f13ba87-40fd-43b7-8b75-529e3b08b2f9" />
<img width="634" height="434" alt="image" src="https://github.com/user-attachments/assets/ece17881-9430-4d04-8925-7cd1afd1f4e6" />
<img width="835" height="561" alt="image" src="https://github.com/user-attachments/assets/f6e3112f-8042-477b-bd26-9121eadd1659" />

# OBS: o método TokenService.adicionar_permissoes() contém a lógica para inserir no token as permissões do seu projeto que estão vinculadas ao grupo do usuário autenticado.
# OBS 2: os tokens são enviados para o frontend em cookies HttpOnly para proteção contra XSS (cross-site-script)

# 7) Para renovar os tokens de maneira automática, implemente a seguinte configuração na biblioteca axios:

<img width="415" height="628" alt="image" src="https://github.com/user-attachments/assets/cd67616b-f523-4353-b604-e069b3d31dc8" />
<img width="636" height="764" alt="image" src="https://github.com/user-attachments/assets/bb7192d0-d811-4c8a-90b5-b3d3dbf7ad99" />

# OBS: api se refere às urls do seu sistema, apiHub se referem às urls do Hub.



