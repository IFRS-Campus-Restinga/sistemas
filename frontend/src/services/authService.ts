import api from '../../config/apiConfig'

interface AuthParams {
    credential?: string
    accessProfile: 'aluno' | 'servidor' | 'convidado'
}

export interface visitorLoginProps {
    email: string
    password: string
}

const AuthService = {
    login: async (params: visitorLoginProps, system: string | null) => {
        return await api.post('session/login/', params, {
            params: {
                system
            }
        })
    },

    googleLogin: async (params: AuthParams, system: string | null) => {
        return await api.post('session/login/google/', params, {
            params: {
                system
            }
        })
    },

    logout: async () => {
        return await api.post('session/logout/')
    }

}

export default AuthService