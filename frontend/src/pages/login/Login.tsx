import { useState } from "react"
import Base from "../../components/base/Base"
import styles from './Login.module.css'
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import LoginGroupList from "../../components/loginGroupList/LoginGroupList"
import VisitorForm from "../../components/visitorForm/VisitorForm"
import AuthService from "../../services/authService"
import { toast, ToastContainer } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import CustomLoading from "../../components/customLoading/CustomLoading"

export interface visitorAccountProps {
    first_name: string
    last_name: string
    email: string
    password: string
}

export interface visitorAccountErrorProps {
    first_name: string | null
    last_name: string | null
    email: string | null
    password: string | null
    passwordConfirmation: string | null
}

export interface JwtPayload {
    group: string;
    first_name?: string;
    last_name?: string;
}


const Login = () => {
    const redirect = useNavigate()
    const [loginGroup, setLoginGroup] = useState<'Aluno' | 'Servidor' | 'Convidado'>('Aluno')
    const [loginWithExternalAccount, setLoginWithExternalAccount] = useState<boolean>(false)
    const [createAccount, setCreateAccount] = useState<boolean>(false)
    const [isDisabled, setIsDisabled] = useState<boolean>(false)
    const [accessRequested, setAccessRequested] = useState<boolean>(false)
    const [visitorAccountData, setVisitorAccountData] = useState<visitorAccountProps>({
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    })
    const [errors, setErrors] = useState<visitorAccountErrorProps>({
        email: null,
        password: null,
        passwordConfirmation: null,
        first_name: null,
        last_name: null
    })

    const changeGroup = (group: 'Aluno' | 'Servidor' | 'Convidado') => {
        setLoginGroup(group)

        if (group === 'Aluno' || group === 'Servidor') {
            setLoginWithExternalAccount(false)
            setCreateAccount(false)
            setVisitorAccountData({
                email: '',
                password: '',
                first_name: '',
                last_name: ''
            })
        }

        setErrors({
            email: null,
            password: null,
            passwordConfirmation: null,
            first_name: null,
            last_name: null
        })
    }

    const handleSuccess = async (response: CredentialResponse) => {
        setIsDisabled(true)

        const req = AuthService.googleLogin({ credential: response.credential, group: loginGroup })

        toast.promise(
            (async () => {
                try {
                    const res = await req;

                    if ('first_login' in res.data) {
                        setAccessRequested(true)
                    } else {
                        sessionStorage.setItem('access', res.data.access)
                        sessionStorage.setItem('refresh', res.data.refresh)

                        setErrors({
                            email: null,
                            first_name: null,
                            last_name: null,
                            password: null,
                            passwordConfirmation: null
                        });

                        setTimeout(() => {
                            redirect(`/${jwtDecode<JwtPayload>(res.data.access).group}/home`);
                        }, 2000);
                    }

                    return res;
                } finally {
                    setIsDisabled(false);
                }
            })(),
            {
                pending: 'Solicitando Login...',
                success: 'Solicitação finalizada com sucesso!',
                error: {
                    render({ data }: { data: any }) {
                        try {
                            const parsed = JSON.parse(data.message);
                            if (Array.isArray(parsed)) {
                                return parsed.join('\n');
                            }
                            return parsed || 'Erro ao solicitar login.';
                        } catch {
                            return data?.response?.data?.message || 'Erro ao solicitar login.';
                        }
                    }
                }
            }
        );
    }


    const handleError = () => {
        toast.error('Não foi possível realizar o login com o Google. Tente novamente.');
    };


    return (
        <Base>
            <ToastContainer />
            {
                accessRequested ? (
                    <section className={styles.sectionMessage}>
                        <h2 className={styles.h2} style={{ textAlign: 'center' }}>Acesso Solicitado com Sucesso!</h2>
                        <p className={styles.p} style={{ textAlign: 'center' }}>
                            Por questões de segurança, seu acesso como {loginGroup} necessitará de aprovação prévia de um administrador
                            <br />
                            <br />
                            Você será notificado através do email informado assim que o pedido de acesso for aprovado.
                        </p>
                    </section>
                ) : (
                    <section className={styles.section}>
                        <LoginGroupList changeLoginGroup={changeGroup} loginGroup={loginGroup} />
                        <hr className={styles.hr} />
                        <div className={styles.loginOptions}>
                            <h2 className={styles.h2}>Faça seu Login</h2>
                            {
                                loginGroup === 'Convidado' && !isDisabled ? (
                                    <div className={styles.visitorOptions}>
                                        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />

                                        <span className={styles.span}>
                                            <hr className={styles.horizontalHr} />
                                            <p className={styles.optionP} onClick={() => setLoginWithExternalAccount((prev) => !prev)}>Já tem uma conta?</p>
                                            <hr className={styles.horizontalHr} />
                                        </span>
                                        {
                                            loginWithExternalAccount ? (
                                                <VisitorForm createAccount={createAccount} setCreateAccount={setCreateAccount} formData={visitorAccountData} setFormData={setVisitorAccountData} errors={errors} setErrors={setErrors} disableButton={isDisabled} />
                                            ) : null
                                        }
                                    </div>
                                ) : isDisabled ? (
                                    <CustomLoading />
                                ) : (
                                    <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
                                )
                            }
                        </div>
                    </section>
                )
            }
        </Base >
    )
}

export default Login