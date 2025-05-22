import { useState } from "react"
import Base from "../../components/base/Base"
import styles from './Login.module.css'
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import LoginGroupList from "../../components/loginGroupList/LoginGroupList"
import VisitorForm from "../../components/visitorForm/VisitorForm"
import AuthService from "../../services/loginService"
import { toast, ToastContainer } from "react-toastify"

export interface visitorAccountProps {
    email: string
    password: string
}

export interface visitorAccountErrorProps {
    email: string | null
    password: string | null
    passwordConfirmation: string | null
}


const Login = () => {
    const [loginGroup, setLoginGroup] = useState<'Aluno' | 'Servidor' | 'Convidado'>('Aluno')
    const [loginWithExternalAccount, setLoginWithExternalAccount] = useState<boolean>(false)
    const [createAccount, setCreateAccount] = useState<boolean>(false)
    const [isDisabled, setIsDisabled] = useState<boolean>(false)
    const [accessRequested, setAccessRequested] = useState<boolean>(false)
    const [visitorAccountData, setVisitorAccountData] = useState<visitorAccountProps>({
        email: '',
        password: ''
    })
    const [errors, setErrors] = useState<visitorAccountErrorProps>({
        email: null,
        password: null,
        passwordConfirmation: null
    })

    const changeGroup = (group: 'Aluno' | 'Servidor' | 'Convidado') => {
        setLoginGroup(group)

        if (group === 'Aluno' || group === 'Servidor') {
            setLoginWithExternalAccount(false)
            setCreateAccount(false)
            setVisitorAccountData({
                email: '',
                password: '',
            })
        }

        setErrors({
            email: null,
            password: null,
            passwordConfirmation: null
        })
    }

    const handleSuccess = async (response: CredentialResponse) => {
        setIsDisabled(true)

        const req = AuthService.googleLogin({ credential: response.credential, group: loginGroup })

        toast.promise(
            req,
            {
                pending: 'Solicitando Login...',
                success: 'Pedido finalizado com sucesso!',
                error: 'Erro ao solicitar login.'
            }
        );

        setIsDisabled(false)

        if (loginGroup !== 'Aluno') setAccessRequested(true)
    }

    const handleError = () => {
        toast.error('Não foi possível realizar o login com o Google. Tente novamente.');
    };


    return (
        <Base>
            <ToastContainer />
            {
                isDisabled ? (
                    <h2 className={styles.h2}>Realizando Login</h2>
                ) : accessRequested && loginGroup !== "Aluno" ? (
                    <>
                        <h2 className={styles.h2}>Acesso Solicitado com Sucesso</h2>
                        <p className={styles.p}>
                            Por questões de segurança, seu acesso como {loginGroup} necessitará de aprovação prévia de um administrador
                            <br />
                            Você será notificado através do email informado assim que o pedido de acesso for aprovado.
                        </p>
                    </>
                ) : (
                    <section className={styles.section}>
                        <LoginGroupList changeLoginGroup={changeGroup} loginGroup={loginGroup} />
                        <hr className={styles.hr} />
                        <div className={styles.loginOptions}>
                            <h2 className={styles.h2}>Faça seu Login</h2>
                            {
                                loginGroup === 'Convidado' ? (
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