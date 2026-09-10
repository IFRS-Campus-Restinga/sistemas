from django.db.models import Prefetch


def _build_queryset(queryset, field_map):
    model = queryset.model
    only_fields = [model._meta.pk.name]
    select_fields = []
    prefetches = []

    for field_name, nested_fields in field_map.items():
        if field_name == "status":
            only_fields.append("is_active")
            continue

        if field_name == "id" and model._meta.model_name in {"group", "permission"}:
            prefetches.append(
                Prefetch(
                    "uuid_map",
                    queryset=model._meta.get_field("uuid_map").related_model.objects.only("uuid"),
                )
            )
            continue

        try:
            field = model._meta.get_field(field_name)
        except LookupError:
            continue

        if not field.is_relation:
            only_fields.append(field_name)
            continue

        related_model = field.related_model
        if related_model is None:
            continue

        if field.concrete and (field.many_to_one or field.one_to_one):
            only_fields.append(field.attname)
            if not isinstance(nested_fields, dict):
                continue

            select_fields.append(field_name)
            nested_queryset, nested_only, nested_select, nested_prefetches = _build_queryset(
                related_model.objects.all(),
                nested_fields,
            )
            only_fields.extend(
                f"{field_name}__{nested_field}"
                for nested_field in nested_only
                if nested_field != related_model._meta.pk.name
            )
            select_fields.extend(
                f"{field_name}__{nested_select_field}"
                for nested_select_field in nested_select
            )
            prefetches.extend(
                Prefetch(
                    f"{field_name}__{lookup.prefetch_through}",
                    queryset=lookup.queryset,
                )
                for lookup in nested_prefetches
            )
            continue

        if isinstance(nested_fields, dict):
            related_queryset, _, _, _ = _build_queryset(
                related_model.objects.all(),
                nested_fields,
            )
        else:
            related_queryset = related_model.objects.all().only(
                related_model._meta.pk.name
            )

        prefetches.append(
            Prefetch(field_name, queryset=related_queryset)
        )

    queryset = queryset.only(*dict.fromkeys(only_fields))
    if select_fields:
        queryset = queryset.select_related(*dict.fromkeys(select_fields))
    if prefetches:
        queryset = queryset.prefetch_related(*prefetches)
    return queryset, only_fields, select_fields, prefetches


def optimize_queryset(queryset, fields_param):
    """Restrict a queryset to fields requested by the API fields parameter."""
    fields = [field.strip() for field in fields_param.split(",") if field.strip()]
    field_map = {}
    for field in fields:
        current = field_map
        parts = field.split(".")
        for index, part in enumerate(parts):
            if index == len(parts) - 1:
                current[part] = True
            else:
                current = current.setdefault(part, {})

    optimized_queryset, _, _, _ = _build_queryset(queryset, field_map)
    return optimized_queryset