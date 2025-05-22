import type { AxiosResponse } from 'axios';
import api from '../../config/apiConfig'
import type { visitorAccountProps } from '../pages/login/Login'

interface AuthParams {
    credential?: string
    group: 'Aluno' | 'Servidor' | 'Convidado'
}

type LoginSuccessResponse = {
    access: string;
    refresh: string;
};

type LoginFirstLoginResponse = {
    first_login: true;
};

type LoginResponse = LoginSuccessResponse | LoginFirstLoginResponse;

const AuthService = {
    createAccount: async (visitorData: visitorAccountProps) => {
        const params = {
            ...visitorData,
            group: 'Convidado'
        }
        const res = await api.post('/auth/convidado/createAccount/', params)

        if (res.status !== 201) return new Error(res.data.message)

        return res
    },

    googleLogin: async (params: AuthParams): Promise<AxiosResponse<LoginResponse>> => {
        return await api.post('/auth/login/', params)
    },


}

export default AuthService