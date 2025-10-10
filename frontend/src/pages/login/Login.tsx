import { useEffect, useState } from "react"
import Base from "../../components/base/Base"
import styles from './Login.module.css'
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import LoginGroupList from "../../components/loginGroupList/LoginGroupList"
import VisitorForm from "../../components/visitorForm/VisitorForm"
import AuthService, { type visitorLoginProps } from "../../services/authService"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import CustomLoading from "../../components/customLoading/CustomLoading"
import { comparePasswords, validateEmail, validateName, validatePassword } from "../../utils/validations/authValidations"
import { useSetUser, useUser } from "../../store/userHooks"
import UserService, {type visitorAccountProps} from "../../services/userService"
import { SystemService } from "../../services/systemService"
import { AxiosError } from "axios"

export interface visitorAccountErrorProps {
    first_name: string | null
    last_name: string | null
    email: string | null
    password: string | null
    passwordConfirmation: string | null
}

export interface visitorLoginErrorProps {
    email: string | null
    password: string | null
}

const Login = () => {
    const setUser = useSetUser()
    const user = useUser()
    const redirect = useNavigate()
    const queryParams = new URLSearchParams(location.search);
    const systemId = queryParams.get('system')
    const [systemURL, setSystemURL] = useState<string>('')
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>('')
    const [accessProfile, setAccessProfile] = useState<'aluno' | 'servidor' | 'convidado'>('aluno')
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

    const changeAccessProfile = (group: 'aluno' | 'servidor' | 'convidado') => {
        setAccessProfile(group)

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

        try {
            const res = await AuthService.googleLogin({ credential: response.credential, accessProfile: accessProfile }, systemId)
            
            if (!res.data.user) {
                setAccessRequested(true)

                setTimeout(() => {
                    setAccessRequested(false)
                }, 3000);

                setIsDisabled(false)
            } else {
                if (!systemURL) {
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
                            if (group === 'admin') redirect(`/session/admin/home`)
                            if (group === 'user') redirect(`/session/user/home`)
                        }
                    }
                } 
                 else {
                    const url = `${systemURL}/session/token?user=${res.data.user.id}&profilePicture=${res.data.user.profile_picture}`;
    
                    window.location.href = url
                }
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message[0])
                setIsDisabled(false)
            } else {
                console.error(error)
            }
        }
    }

    const handleError = () => {
        toast.error('Não foi possível realizar o login com o Google. Tente novamente.');
    };

    const handleCreateAccount = (e: React.FormEvent) => {
        e.preventDefault()

        setIsDisabled(true)

        if (!validateRegisterForm()) return

        if ('first_name' in visitorAccountData) {
            const req = UserService.createAccount(visitorAccountData)

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
                            if (data instanceof AxiosError) return data.response?.data.message[0]
                        }
                    }
                }
            )

            setTimeout(() => {
               setAccessRequested(false)
               setCreateAccount(false)
               setVisitorAccountData({
                email: '',
                first_name: '',
                last_name: '',
                password: ''
               })
            }, 2000);
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        setIsDisabled(true)

        if (!validateLoginForm()) return

        try {
            if (!createAccount) {
                const req = AuthService.login(visitorAccountData, systemId)
    
                const res = await req;
    
                if ('is_active' in res.data) {
                    setAccessRequested(true)
                    setTimeout(() => {
                        setAccessRequested(false)
                    }, 3000);
                    setIsDisabled(false)
                } else {
                    if (!systemURL) {
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
                                if (group === 'admin') redirect(`/session/admin/home`)
                                if (group === 'user') redirect(`/session/user/home`)
                            }
                        }
                    } 
                     else {
                        const url = `${systemURL}/session/token?user=${res.data.user.id}&profilePicture=${res.data.user.profile_picture}`;
    
                        window.location.href = url
                    }
                }
    
                return res;
            }
        } catch (error) {
             if (error instanceof AxiosError) {
                toast.error(error.response?.data.message[0])
                setIsDisabled(false)
            } else {
                console.error(error)
            }
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

    const fetchSystem = async () => {
        try {
            const res = await SystemService.get(systemId!, 'system_url')

            setSystemURL(res.data.system_url)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message)
            } else {
                console.error(error)
            }
        }
    }

    useEffect(() => {
        if (systemId) fetchSystem()
    }, [systemId])

    const fetchUserData = async () => {
        try {
            const res = await UserService.getData()

            setUser(res.data)
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error?.response?.status === 401) {
                    console.error("Token inválido ou refresh falhou, redirecionando.")
                    redirect('/session')
                } else {
                    console.error("Erro inesperado ao buscar usuário:", error)
                }
            }
        }
    }

    useEffect(() => {
        fetchUserData()
    }, [])

    useEffect(() => {
        if (user.groups?.includes("admin")) redirect("/session/admin/home")
        if (user.groups?.includes("user")) redirect("/session/user/home")
    }, [user])

    return (
        <Base navBar={<></>}>
            {
                accessRequested ? (
                    <section className={styles.sectionMessage}>
                        <h2 className={styles.h2} style={{ textAlign: 'center' }}>Acesso Solicitado com Sucesso!</h2>
                        <p className={styles.p} style={{ textAlign: 'center' }}>
                            Por questões de segurança, seu acesso como {accessProfile} necessitará de aprovação prévia de um administrador
                            <br />
                            <br />
                            Você será notificado através do email informado assim que o pedido de acesso for aprovado.
                        </p>
                    </section>
                ) : (
                    <>
                        <h2 className={styles.title}>HUB de Sistemas do IFRS</h2>
                        <section className={styles.section}>
                            <LoginGroupList changeLoginGroup={changeAccessProfile} loginGroup={accessProfile} />
                            <hr className={styles.hr} />
                            <div className={styles.loginOptions}>
                                <h2 className={styles.h2}>Faça seu Login</h2>
                                {
                                    accessProfile === 'convidado' && !isDisabled ? (
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
                    </>
                )
            }
        </Base >
    )
}

export default Login