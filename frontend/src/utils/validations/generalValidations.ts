export const validateMandatoryStringField = (value: string, customMessage?: string) => {
    if (value.length === 0) return customMessage ?? 'Campo obrigatório'

    return null

}

export const validateMandatoryArrayField = (value: Array<any>, customMessage?: string) => {
    if (value.length === 0) return customMessage ?? 'Este campo é obrigatório'

    return null
}

export const compareDates = (date1: string, date2: string, message?: string) => {
    const start = new Date(date1)
    const end = new Date(date2)

    if (end < start) {
        return message ?? "Data de encerramento não pode ser inferior à de início"
    }

    return null
}

export const validateMandatoryUUIDField = (value:  string, customMessage?: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(value)) return customMessage ?? 'Este campo é obrigatório'

    return null

}