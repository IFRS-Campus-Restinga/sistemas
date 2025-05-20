import { useState } from "react"
import Base from "../../components/base/Base"
import styles from './Login.module.css'
import visitor from '../../assets/user-svgrepo-com.svg'
import student from '../../assets/user-graduate-svgrepo-com.svg'
import employee from '../../assets/user-suit-svgrepo-com.svg'
import check from '../../assets/check-circle-svgrepo-com.svg'
import { GoogleLogin } from "@react-oauth/google"
import CustomInput from "../../components/customInput/CustomInput"
import { comparePasswords, validateEmail, validatePassword } from "../../utils/validations"
import CustomButton from "../../components/customButton/CustomButton"

interface visitorAccountProps {
    email: string
    password: string
}

interface visitorAccountErrorProps {
    email: string | null
    password: string | null
    passwordConfirmation: string | null
}


const Login = () => {
    const [loginGroup, setLoginGroup] = useState<'Aluno' | 'Servidor' | 'Convidado' | null>(null)
    const [passwordIsVisible, setPassswordIsVisible] = useState<boolean>(false)
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>('')
    const [loginWithExternalAccount, setLoginWithExternalAccount] = useState<boolean>(false)
    const [visitorAccountData, setVisitorAccountData] = useState<visitorAccountProps>({
        email: '',
        password: ''
    })
    const [errors, setErrors] = useState<visitorAccountErrorProps>({
        email: null,
        password: null,
        passwordConfirmation: null
    })

    const handleSuccess = () => {

    }

    const handleError = () => {

    }

    return (
        <Base>
            <section className={styles.section}>
                <div className={styles.div}>
                    <ul className={styles.ul}>
                        <li className={loginGroup === 'Aluno' ? styles.liSelected : styles.li}
                            onClick={() => {
                                setLoginGroup('Aluno')
                                setLoginWithExternalAccount(false)
                            }}>
                            <div className={styles.divLi}>
                                <span className={styles.span}>
                                    <img className={styles.img} src={student} alt="Aluno" />
                                    <h2 className={styles.h2}>Aluno</h2>
                                </span>
                                {
                                    loginGroup === 'Aluno' ? (
                                        <img className={styles.img} src={check} alt="marcado" />
                                    ) : null
                                }
                            </div>
                            <p className={styles.p}>Selecione este grupo de acesso caso seja aluno da instituição</p>
                        </li>
                        <li className={loginGroup === 'Servidor' ? styles.liSelected : styles.li}
                            onClick={() => {
                                setLoginGroup('Servidor')
                                setLoginWithExternalAccount(false)
                            }}>
                            <div className={styles.divLi}>
                                <span className={styles.span}>
                                    <img className={styles.img} src={employee} alt="Servidor" />
                                    <h2 className={styles.h2}>Servidor</h2>
                                </span>
                                {
                                    loginGroup === 'Servidor' ? (
                                        <img className={styles.img} src={check} alt="marcado" />
                                    ) : null
                                }
                            </div>
                            <p className={styles.p}>Selecione este grupo de acesso caso seja servidor de qualquer área da instituição</p>
                        </li>
                        <li className={loginGroup === 'Convidado' ? styles.liSelected : styles.li}
                            onClick={() => setLoginGroup('Convidado')}>
                            <div className={styles.divLi}>
                                <span className={styles.span}>
                                    <img className={styles.img} src={visitor} alt="Convidado" />
                                    <h2 className={styles.h2}>Convidado</h2>
                                </span>
                                {
                                    loginGroup === 'Convidado' ? (
                                        <img className={styles.img} src={check} alt="marcado" />
                                    ) : null
                                }
                            </div>
                            <p className={styles.p}>Selecione este grupo de acesso caso não seja membro da instituição</p>
                        </li>
                    </ul>
                </div>
                <hr className={styles.hr} />
                <div className={styles.loginOptions}>
                    <h2 className={styles.h2}>Faça seu Login</h2>
                    {
                        loginGroup === 'Convidado' ? (
                            <div className={styles.visitorOptions}>
                                <GoogleLogin onSuccess={handleSuccess} onError={handleError} />

                                <span className={styles.span}>
                                    <hr className={styles.horizontalHr} />
                                    <p className={styles.p}>Ou</p>
                                    <hr className={styles.horizontalHr} />
                                </span>

                                <p className={styles.optionP} onClick={() => setLoginWithExternalAccount((prev) => !prev)}>Crie uma conta</p>

                                {
                                    loginWithExternalAccount ? (
                                        <form className={styles.visitorForm}>
                                            <label className={styles.label}>
                                                Email
                                                <CustomInput
                                                    type="text"
                                                    value={visitorAccountData.email}
                                                    error={errors.email}
                                                    onChange={(e) => setVisitorAccountData({ ...visitorAccountData, email: e.target.value })}
                                                    onBlur={() => setErrors({ ...errors, email: validateEmail(visitorAccountData.email) })}
                                                />
                                            </label>
                                            <label className={styles.label}>
                                                Senha
                                                <CustomInput
                                                    type="text"
                                                    value={visitorAccountData.password}
                                                    error={errors.password}
                                                    onChange={(e) => setVisitorAccountData({ ...visitorAccountData, password: e.target.value })}
                                                    onBlur={() => setErrors({ ...errors, password: validatePassword(visitorAccountData.password) })}
                                                />
                                            </label>
                                            <label className={styles.label}>
                                                Confirme a senha
                                                <CustomInput
                                                    type="text"
                                                    value={visitorAccountData.email}
                                                    error={errors.email}
                                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                                    onBlur={() => setErrors({ ...errors, passwordConfirmation: comparePasswords(visitorAccountData.password, passwordConfirmation) })}
                                                />
                                            </label>
                                            <CustomButton text="Criar conta" type="submit" />
                                        </form>
                                    ) : null
                                }
                            </div>
                        ) : (
                            <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
                        )
                    }
                </div>
            </section>
        </Base>
    )
}

export default Login