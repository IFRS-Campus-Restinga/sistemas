import api from '../../config/apiConfig'
import { extractError } from '../utils/handleAxiosError';

interface AuthParams {
    credential?: string
    accessProfile: 'aluno' | 'servidor' | 'convidado'
}

export interface visitorLoginProps {
    email: string
    password: string
}

const AuthService = {
    login: async (params: visitorLoginProps) => {
        try {
            const res = await api.post('session/login/', params)

            return res
        } catch (error: any) {
            throw extractError(error)
        }
    },

    googleLogin: async (params: AuthParams) => {
        try {
            const res = await api.post('session/login/google/', params)

            return res
        } catch (error) {
            throw extractError(error)
        }
    },

    logout: async () => {
        try {
            const res = await api.post('session/logout/')

            return res
        } catch (error) {
            throw extractError(error)
        }
    }

}

export default AuthService