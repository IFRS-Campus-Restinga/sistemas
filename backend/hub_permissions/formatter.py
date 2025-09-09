from .models import PermissionUUIDMap, Permission

class URLFieldsParser:
    @staticmethod
    def build_field_map(fields: list[str]) -> dict:
        field_map: dict = {}
        for field in fields:
            parts = field.split(".")
            current = field_map
            for i, part in enumerate(parts):
                if i == len(parts) - 1:
                    current[part] = True
                else:
                    current = current.setdefault(part, {})
        return field_map

    @staticmethod
    def extract_instance_fields(instance, field_map: dict):
        result = {}

        for field, subfields in field_map.items():
            # Regra especial: se for Permission e o campo é "id", usa uuid_map.uuid
            if isinstance(instance, Permission) and field == "id":
                try:
                    value = instance.uuid_map.uuid
                except PermissionUUIDMap.DoesNotExist:
                    value = None
                result[field] = value
                continue

            if not hasattr(instance, field):
                result[field] = None
                continue

            value = getattr(instance, field)

            # ManyToMany / reverse FK
            if hasattr(value, "all"):
                items = []
                for obj in value.all():
                    if isinstance(subfields, dict):
                        items.append(URLFieldsParser.extract_instance_fields(obj, subfields))
                    else:
                        items.append(obj)
                result[field] = items

            # FK / OneToOne
            elif isinstance(subfields, dict):
                result[field] = URLFieldsParser.extract_instance_fields(value, subfields) if value else None

            # Campo simples
            else:
                result[field] = value

        return result

    @staticmethod
    def parse(instance, fields_param: str):
        """
        Função única que o serializer chama.
        Recebe a instância e a string de campos da URL (?fields=id,nome,...).
        """
        fields = [f.strip() for f in fields_param.split(",")]
        field_map = URLFieldsParser.build_field_map(fields)
        return URLFieldsParser.extract_instance_fields(instance, field_map)
