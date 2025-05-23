import type { Axios, AxiosResponse } from 'axios';
import api from '../../config/apiConfig'
import type { visitorAccountProps, visitorLoginProps } from '../pages/login/Login'
import { extractError } from '../utils/handleAxiosError';

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
    createAccount: async (visitorData: visitorAccountProps): Promise<AxiosResponse<LoginFirstLoginResponse>> => {
        const params = {
            ...visitorData,
            group: 'Convidado'
        }

        try {
            const res = await api.post('/auth/convidado/createAccount/', params)

            return res
        } catch (error: any) {
            throw extractError(error)
        }

    },

    login: async (params: visitorLoginProps): Promise<AxiosResponse<LoginResponse>> => {
        try {
            const res = await api.post('/auth/login/', params)

            return res
        } catch (error: any) {
            throw extractError(error)
        }
    },

    googleLogin: async (params: AuthParams): Promise<AxiosResponse<LoginResponse>> => {
        try {
            const res = await api.post('/auth/login/google/', params)

            return res
        } catch (error) {
            throw extractError(error)
        }
    },


}

export default AuthService