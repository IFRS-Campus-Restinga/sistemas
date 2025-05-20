export const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if (email.length === 0) return 'Campo obrigatório'

    if (!emailRegex.test(email)) return 'Formato de email inválido'

    return null
}

export const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/

    if (password.length === 0) return 'Campo obrigatório'

    if (passwordRegex.test(password)) return 'A senha deve conter ao menos: 1 letra maíuscula, 1 número, 1 caractere especial e no mínimo 8 dígitos'

    return null
}

export const comparePasswords = (password1: string, password2: string) => {
    if (password1 !== password2) return 'A senha e confirmação não correspondem'

    return null
}