class URLFieldsParser:
    @staticmethod
    def build_field_map(fields: list[str]) -> dict:
        """
        Constrói um mapa hierárquico a partir da lista de campos.
        Exemplo: ["id", "groups.id", "groups.name"] →
        {
            "id": True,
            "groups": {
                "id": True,
                "name": True
            }
        }
        """
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
    def extract_instance_fields(instance, field_map: dict, parent_field: str = None):
        """
        Extrai os valores dos campos especificados em field_map da instância.
        """
        result = {}

        for field, subfields in field_map.items():
            if not hasattr(instance, field):
                result[field] = None
                continue

            value = getattr(instance, field)

            # ManyToMany / reverse FK
            if hasattr(value, "all"):
                items = []
                for obj in value.all():
                    # Caso especial: groups.id → usar UUID do GroupUUIDMap
                    if parent_field == "groups" or field == "groups":
                        if isinstance(subfields, dict) and "id" in subfields:
                            obj_data = {"id": str(getattr(obj.uuid_map, "uuid", None))}
                            other_fields = {k: v for k, v in subfields.items() if k != "id"}
                            if other_fields:
                                obj_data.update(
                                    URLFieldsParser.extract_instance_fields(
                                        obj, other_fields, parent_field=field
                                    )
                                )
                            items.append(obj_data)
                            continue

                    # Caso normal ManyToMany
                    if isinstance(subfields, dict):
                        items.append(
                            URLFieldsParser.extract_instance_fields(
                                obj, subfields, parent_field=field
                            )
                        )
                    else:
                        items.append(obj)
                result[field] = items

            # FK / OneToOne
            elif isinstance(subfields, dict):
                result[field] = (
                    URLFieldsParser.extract_instance_fields(
                        value, subfields, parent_field=field
                    )
                    if value else None
                )

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
