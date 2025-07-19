export const validateMandatoryStringField = (value: string) => {
    if (value.length === 0) return 'Campo obrigatório'

    return null

}

export const validateMandatoryArrayField = (value: Array<any>, customMessage?: string) => {
    if (value.length === 0) return customMessage ?? 'Este campo é obrigatório'

    return null
}

export const compareDates = (date1: string, date2: string) => {
    const start = new Date(date1)
    const end = new Date(date2)

    if (end < start) {
        return "Data de encerramento não pode ser inferior à de início"
    }

    return null
}