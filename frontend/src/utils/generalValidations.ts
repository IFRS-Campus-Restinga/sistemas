export const validateMandatoryStringField = (value: string) => {
    if (value.length === 0) return 'Campo obrigatório'

    return null
}