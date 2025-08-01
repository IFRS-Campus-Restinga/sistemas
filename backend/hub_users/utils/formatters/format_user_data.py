from hub_users.models import CustomUser

class FormatUserData:
    @staticmethod
    def list_format(instance: CustomUser):
        """Recebe uma instância de usuário e a retorna no formato de listagem"""

        return {
            "id": instance.id,
            "nome": f"{instance.first_name}{instance.last_name}" if instance.first_name else "-",
            "email": instance.email,
            "ativo": "Ativo" if instance.is_active else "Inativo",
        }
    
    @staticmethod
    def search_format(instance: CustomUser):
        """Retorna usuários no formato de sugestões de pesquisa
        
        Contém apenas id e um identificador (title) que pode ser uma combinação de first e last_name ou um email"""

        return {
            "id": instance.id,
            "title": f"{instance.first_name} {instance.last_name}" if instance.first_name else instance.email
        }
    
    @staticmethod
    def request_format(instance: CustomUser):
        return {
            "id": instance.id,
            "nome": f"{instance.first_name} {instance.last_name}",
            "email": instance.email,
            "perfil": instance.access_profile,
        }

    @staticmethod
    def details_format(instance: CustomUser):
        """Recebe uma instância de usuário e a retorna no 
        formato de detalhes, contendo todos os campos básicos
        incluindo grupos e permissões"""

