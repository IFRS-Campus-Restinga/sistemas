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

export const validateCPF = (cpf: string) => {
    if (!cpf) return "Campo obrigatótio";

    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return "CPF inválido";

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return "CPF inválido";

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf[i]) * (10 - i);
    }
    let res = (sum * 10) % 11;
    if (res === 10) res = 0;
    if (res !== parseInt(cpf[9])) return "CPF inválido";

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf[i]) * (11 - i);
    }
    res = (sum * 10) % 11;
    if (res === 10) res = 0;
    if (res !== parseInt(cpf[10])) return "CPF inválido";

    return null;
}

export const validatePhoneNumber = (phone: string) => {
    if (!phone) return "Campo obrigatório";

    const digits = phone.replace(/\D/g, '');

    if (digits.length < 10 || digits.length > 11) {
        return "Telefone deve conter 10 dígitos";
    }

    const areaCode = parseInt(digits.substring(0, 2), 10);
    if (areaCode < 11 || areaCode > 99) {
        return "Código de área inválido";
    }

    if (/^(\d)\1+$/.test(digits)) {
        return "Telefone inválido";
    }

    return null;
}

export const validateBirthDate = (birthDate: string) => {
    if (!birthDate) return "A data de nascimento é obrigatória.";

    // Tenta criar um objeto Date
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) return "Formato de data de nascimento inválido.";

    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();

    // Ajusta idade se ainda não fez aniversário este ano
    const adjustedAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (adjustedAge < 14) return "A idade mínima permitida é 14 anos.";
    if (adjustedAge > 100) return "A idade máxima permitida é 100 anos.";

    return null; // sem erros
}

export function validateRegistration(registration: string, accessProfile: string): string | null {
    if (!registration) return "A matrícula é obrigatória.";

    // Validação para servidor (SIAPE: geralmente 7 dígitos)
    if (accessProfile === 'servidor') {
        const siapePattern = /^\d{7}$/;
        if (!siapePattern.test(registration)) {
            return "A matrícula SIAPE deve conter 7 dígitos numéricos.";
        }
    }

    // Validação para aluno (10 dígitos)
    if (accessProfile === 'aluno') {
        const alunoPattern = /^\d{10}$/;
        if (!alunoPattern.test(registration)) {
            return "A matrícula do aluno deve conter 10 dígitos numéricos.";
        }
    }

    return null; // matrícula válida
}



