import api from '../../config/apiConfig'

interface AuthParams {
    credential: string
}

const AuthService = {
    login: async (params: AuthParams) => {
        const res = await api.post('/login/', params)

        if (res.status !== 200) return new Error(res.data.message)

        return res
    }
}

export default AuthService