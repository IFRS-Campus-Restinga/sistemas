def format_validation_errors(errors):
    """
    Converte serializer.errors ou ValidationError.detail
    para lista de strings no formato: "campo: mensagem"
    """
    formatted = []

    if isinstance(errors, dict):
        for field, messages in errors.items():
            if isinstance(messages, (list, tuple)):
                for msg in messages:
                    formatted.append(f"{field}: {msg}")
            else:
                formatted.append(f"{field}: {messages}")
    elif isinstance(errors, list):
        for msg in errors:
            formatted.append(str(msg))
    else:
        formatted.append(str(errors))

    return formatted
