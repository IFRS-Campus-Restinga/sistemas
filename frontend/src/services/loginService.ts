import api from '../../config/apiConfig'
import type { visitorAccountProps } from '../pages/login/Login'

interface AuthParams {
    credential?: string
    accessGroup: 'Aluno' | 'Servidor' | 'Convidado'
}

const AuthService = {
    createAccount: async (visitorData: visitorAccountProps) => {
        const params = {
            ...visitorData,
            accessGroup: 'Convidado'
        }
        const res = await api.post('/auth/convidado/createAccount/', params)

        if (res.status !== 201) return new Error(res.data.message)

        return res
    },

    googleLogin: async (params: AuthParams) => {
        const res = await api.post('/login/', params)

        if (res.status !== 200) return new Error(res.data.message)

        return res
    },


}

export default AuthService