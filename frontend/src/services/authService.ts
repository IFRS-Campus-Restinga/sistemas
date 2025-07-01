import type { AxiosResponse } from 'axios';
import api from '../../config/apiConfig'
import type { visitorAccountProps, visitorLoginProps } from '../pages/login/Login'
import { extractError } from '../utils/handleAxiosError';
import type { UserState } from '../store/userSlice';

interface AuthParams {
    credential?: string
    group: 'aluno' | 'servidor' | 'convidado'
}

type LoginSuccessResponse = {
    user: UserState;
};

type LoginFirstLoginResponse = {
    is_active: false;
};

type LoginResponse = LoginSuccessResponse | LoginFirstLoginResponse;

const AuthService = {
    createAccount: async (visitorData: visitorAccountProps): Promise<AxiosResponse<LoginFirstLoginResponse>> => {
        const params = {
            ...visitorData,
            group: 'convidado'
        }

        try {
            const res = await api.post('/user/account/create/', params)

            return res
        } catch (error: any) {
            throw extractError(error)
        }

    },

    login: async (params: visitorLoginProps): Promise<AxiosResponse<LoginResponse>> => {
        try {
            const res = await api.post('/session/login/', params)

            return res
        } catch (error: any) {
            throw extractError(error)
        }
    },

    googleLogin: async (params: AuthParams): Promise<AxiosResponse<LoginResponse>> => {
        try {
            const res = await api.post('/session/login/google/', params)

            return res
        } catch (error) {
            throw extractError(error)
        }
    },

    logout: async () => {
        try {
            const res = await api.post('/session/logout/')

            return res
        } catch (error) {
            throw extractError(error)
        }
    }

}

export default AuthService