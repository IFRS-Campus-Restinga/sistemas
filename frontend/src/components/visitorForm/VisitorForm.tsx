import styles from './VisitorForm.module.css'
import { useEffect, useState } from 'react'
import type { visitorAccountErrorProps, visitorAccountProps } from '../../pages/login/Login'
import { comparePasswords, validateEmail, validateName, validatePassword } from '../../utils/authValidations'
import CustomButton from '../customButton/CustomButton'
import CustomInput from '../customInput/CustomInput'
import visible from '../../assets/eye-show-svgrepo-com.svg'
import hidden from '../../assets/eye-off-svgrepo-com.svg'

interface VisitorFormProps {
    createAccount: boolean
    setCreateAccount: (createAccount: boolean) => void
    formData: visitorAccountProps
    setFormData: (formData: visitorAccountProps) => void
    errors: visitorAccountErrorProps
    setErrors: (errors: visitorAccountErrorProps) => void
    disableButton: boolean
}


const VisitorForm = ({ createAccount, setCreateAccount, formData, setFormData, errors, setErrors, disableButton }: VisitorFormProps) => {
    const [passwordIsVisible, setPassswordIsVisible] = useState<boolean>(false)
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>('')

    useEffect(() => {
        if (!createAccount) setPasswordConfirmation('')
    }, [createAccount])

    return (
        <form className={styles.visitorForm}>
            <label className={styles.label}>
                Email
                <CustomInput
                    type="text"
                    value={formData.email}
                    error={errors.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onBlur={() => setErrors({ ...errors, email: validateEmail(formData.email) })}
                />
            </label>
            {
                createAccount ? (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Nome
                            <CustomInput
                                type="text"
                                max={30}
                                value={formData.first_name}
                                error={errors.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                onBlur={() => setErrors({ ...errors, first_name: validateName(formData.first_name) })}
                            />
                        </label>
                        <label className={styles.label}>
                            Sobrenome
                            <CustomInput
                                type="text"
                                max={30}
                                value={formData.last_name}
                                error={errors.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                onBlur={() => setErrors({ ...errors, last_name: validateName(formData.last_name) })}
                            />
                        </label>
                    </div>
                ) : null
            }
            <label className={styles.label}>
                Senha
                <div className={styles.inputGroupContainer}>
                    <div className={errors.password ? styles.passwordError : styles.passwordContainer}>
                        <input
                            type={passwordIsVisible ? 'text' : 'password'}
                            value={formData.password}
                            className={styles.passwordInput}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            onBlur={() => setErrors({ ...errors, password: validatePassword(formData.password) })}
                        />
                        <img className={styles.inputImg} src={passwordIsVisible ? visible : hidden} alt="mostrar/esconder senha" onClick={() => setPassswordIsVisible((prev) => !prev)} />
                    </div>
                    {
                        errors.password ? (<p className={styles.errorMessage}>{errors.password}</p>) : null
                    }
                </div>
            </label>
            {
                createAccount ? (
                    <>
                        <label className={styles.label}>
                            Confirme a senha
                            <div className={styles.inputGroupContainer}>
                                <div className={errors.passwordConfirmation ? styles.passwordError : styles.passwordContainer}>
                                    <input
                                        type={passwordIsVisible ? 'text' : 'password'}
                                        value={passwordConfirmation}
                                        className={styles.passwordInput}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        onBlur={() => setErrors({ ...errors, passwordConfirmation: comparePasswords(formData.password, passwordConfirmation) })}
                                    />
                                    <img className={styles.inputImg} src={passwordIsVisible ? visible : hidden} alt="mostrar/esconder senha" onClick={() => setPassswordIsVisible((prev) => !prev)} />
                                </div>
                                {
                                    errors.passwordConfirmation ? (<p className={styles.errorMessage}>{errors.passwordConfirmation}</p>) : null
                                }
                            </div>
                        </label>
                        <span className={styles.loginSpan}>
                            Já tem uma conta?
                            <p className={styles.loginP} onClick={() => setCreateAccount(false)}>Fazer Login</p>
                        </span>
                    </>
                ) : (
                    <span className={styles.loginSpan}>
                        Não possui conta?
                        <p className={styles.loginP} onClick={() => setCreateAccount(true)}>Criar conta</p>
                    </span>
                )
            }
            <CustomButton text={createAccount ? 'Criar conta' : 'Entrar'} type="submit" disabled={disableButton} />
        </form>
    )
}

export default VisitorForm