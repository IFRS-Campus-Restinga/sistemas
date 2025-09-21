def format_validation_errors(errors, serializer_class=None):
    """
    Converte serializer.errors ou ValidationError.detail
    para lista de strings no formato: "campo: mensagem".
    Se serializer_class for fornecido, usa verbose_name do modelo para tradução.
    """
    formatted = []

    if isinstance(errors, dict):
        for field, messages in errors.items():
            # tenta pegar verbose_name se serializer_class for informado
            label = field
            if serializer_class:
                try:
                    field_obj = serializer_class().fields.get(field)
                    if field_obj and hasattr(field_obj, "label") and field_obj.label:
                        label = field_obj.label
                except Exception:
                    pass

            if isinstance(messages, (list, tuple)):
                for msg in messages:
                    formatted.append(f"{label}: {msg}")
            else:
                formatted.append(f"{label}: {messages}")
    elif isinstance(errors, list):
        for msg in errors:
            formatted.append(str(msg))
    else:
        formatted.append(str(errors))

    return formatted
