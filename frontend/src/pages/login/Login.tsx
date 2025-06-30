import { useState } from "react"
import Base from "../../components/base/Base"
import styles from './Login.module.css'
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import LoginGroupList from "../../components/loginGroupList/LoginGroupList"
import VisitorForm from "../../components/visitorForm/VisitorForm"
import AuthService from "../../services/authService"
import { toast, ToastContainer } from "react-toastify"
import { useNavigate } from "react-router-dom"
import CustomLoading from "../../components/customLoading/CustomLoading"
import { comparePasswords, validateEmail, validateName, validatePassword } from "../../utils/validations/authValidations"
import { useSetUser } from "../../store/userHooks"

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

export interface visitorLoginProps {
    email: string
    password: string
}

export interface visitorLoginErrorProps {
    email: string | null
    password: string | null
}

export interface JwtPayload {
    group: string;
    first_name?: string;
    last_name?: string;
    profile_picture_src: string
}


const Login = () => {
    const setUser = useSetUser()
    const redirect = useNavigate()
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>('')
    const [loginGroup, setLoginGroup] = useState<'aluno' | 'servidor' | 'convidado'>('aluno')
    const [loginWithExternalAccount, setLoginWithExternalAccount] = useState<boolean>(false)
    const [createAccount, setCreateAccount] = useState<boolean>(false)
    const [isDisabled, setIsDisabled] = useState<boolean>(false)
    const [accessRequested, setAccessRequested] = useState<boolean>(false)
    const [visitorAccountData, setVisitorAccountData] = useState<visitorAccountProps | visitorLoginProps>({
        email: '',
        first_name: '',
        last_name: '',
        password: ''
    })
    const [errors, setErrors] = useState<visitorAccountErrorProps | visitorLoginErrorProps>({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        passwordConfirmation: ''
    })

    const changeGroup = (group: 'aluno' | 'servidor' | 'convidado') => {
        setLoginGroup(group)

        if (group === 'aluno' || group === 'servidor') {
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

                    if ('is_active' in res.data) {
                        setAccessRequested(true)
                    } else {
                        setUser(res.data.user)

                        if (res.data.user.profile_picture) sessionStorage.setItem('profilePicture', res.data.user.profile_picture)

                        setErrors({
                            email: null,
                            first_name: null,
                            last_name: null,
                            password: null,
                            passwordConfirmation: null
                        });

                        if (res.data.user.groups) {
                            const groups = res.data.user.groups

                            for (let group of groups) {
                                if (group === 'admin') redirect(`/auth/admin/home`)
                                if (group === 'membro') redirect(`/auth/membro/home`)
                                if (group === 'visit') redirect(`/auth/visit/home`)
                            }
                        }

                    }

                    return res;
                } finally {
                    setIsDisabled(false);
                }
            })(),
            {
                success: 'Solicitação finalizada com sucesso!',
                error: {
                    render({ data }: { data: any }) {
                        return data.message || 'Erro ao solicitar login'
                    }
                }
            }
        );
    }

    const handleError = () => {
        toast.error('Não foi possível realizar o login com o Google. Tente novamente.');
    };

    const handleCreateAccount = (e: React.FormEvent) => {
        e.preventDefault()

        setIsDisabled(true)
        console.log(validateRegisterForm())
        if (!validateRegisterForm()) return

        if ('first_name' in visitorAccountData) {
            const req = AuthService.createAccount(visitorAccountData)

            toast.promise(
                (async () => {
                    try {
                        await req;

                        setAccessRequested(true)
                    } finally {
                        setIsDisabled(false);
                    }
                })(),
                {
                    success: 'Conta criada com sucesso',
                    error: {
                        render({ data }: any) {
                            return data.message || 'Erro ao criar conta'
                        }
                    }
                }
            )
        }
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateLoginForm()) return


        if (!createAccount) {
            toast.promise(
                (async () => {
                    const req = AuthService.login(visitorAccountData)

                    try {
                        const res = await req;

                        if ('is_active' in res.data) {
                            setAccessRequested(true)
                        } else {
                            setUser(res.data.user)

                            setErrors({
                                email: null,
                                first_name: null,
                                last_name: null,
                                password: null,
                                passwordConfirmation: null
                            });

                            if (res.data.user.groups) {
                                const groups = res.data.user.groups

                                for (let group of groups) {
                                    if (group === 'admin') redirect(`auth/admin/home`)
                                    if (group === 'membro') redirect(`auth/membro/home`)
                                    if (group === 'visit') redirect(`auth/visit/home`)
                                }
                            }
                        }

                        return res;
                    } finally {
                        setIsDisabled(false);
                    }
                })(),
                {
                    success: 'Login finalizado com sucesso!',
                    error: {
                        render({ data }: any) {
                            return data.message || 'Erro ao autenticar'
                        }
                    }
                }
            )
        }

    }

    const validateLoginForm = () => {
        let newErrors: { email: null | string, password: null | string } = {
            email: null,
            password: null,
        }

        for (let key in visitorAccountData) {
            switch (key) {
                case 'email':
                    newErrors.email = validateEmail(visitorAccountData.email)
                    break
                case 'password':
                    newErrors.password = validatePassword(visitorAccountData.password)
                    break
                default:
                    break;
            }
        }

        setErrors(newErrors)

        return Object.values(newErrors).every((error) => error === null)
    }

    const validateRegisterForm = () => {
        let newErrors: visitorAccountErrorProps = {
            email: null,
            first_name: null,
            last_name: null,
            password: null,
            passwordConfirmation: null
        }

        for (let key in visitorAccountData) {
            switch (key) {
                case 'first_name':
                    newErrors.first_name = validateName('first_name' in visitorAccountData ? visitorAccountData.first_name : '')
                    break;
                case 'last_name':
                    newErrors.last_name = validateName('last_name' in visitorAccountData ? visitorAccountData.last_name : '')
                    break
                case 'email':
                    newErrors.email = validateEmail(visitorAccountData.email)
                    break
                case 'password':
                    newErrors.password = validatePassword(visitorAccountData.password)
                    break
                case 'passwordConfirmation':
                    newErrors.passwordConfirmation = comparePasswords(visitorAccountData.password, passwordConfirmation)
                    break
                default:
                    break;
            }
        }

        setErrors(newErrors)

        return Object.values(newErrors).every((error) => error === null)
    }


    return (
        <Base navBar={<></>}>
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
                                loginGroup === 'convidado' && !isDisabled ? (
                                    <div className={styles.visitorOptions}>
                                        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />

                                        <span className={styles.span}>
                                            <hr className={styles.horizontalHr} />
                                            <p className={styles.optionP} onClick={() => setLoginWithExternalAccount((prev) => !prev)}>Já tem uma conta?</p>
                                            <hr className={styles.horizontalHr} />
                                        </span>
                                        {
                                            loginWithExternalAccount ? (
                                                <VisitorForm
                                                    createAccount={createAccount}
                                                    setCreateAccount={setCreateAccount}
                                                    formData={visitorAccountData}
                                                    setFormData={setVisitorAccountData}
                                                    errors={errors}
                                                    setErrors={setErrors}
                                                    disableButton={isDisabled}
                                                    onSubmit={createAccount ? handleCreateAccount : handleLogin}
                                                    passwordConfirmation={passwordConfirmation}
                                                    setPasswordConfirmation={setPasswordConfirmation}
                                                />
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