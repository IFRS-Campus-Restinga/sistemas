import styles from './VisitorForm.module.css'
import { useEffect, useState } from 'react'
import type { visitorAccountErrorProps, visitorAccountProps, visitorLoginErrorProps, visitorLoginProps } from '../../pages/login/Login'
import { comparePasswords, validateEmail, validateName, validatePassword } from '../../utils/validations/authValidations'
import CustomButton from '../customButton/CustomButton'
import CustomInput from '../customInput/CustomInput'
import visible from '../../assets/eye-show-svgrepo-com.svg'
import hidden from '../../assets/eye-off-svgrepo-com.svg'

interface VisitorFormProps {
    createAccount: boolean
    setCreateAccount: (createAccount: boolean) => void
    formData: visitorAccountProps | visitorLoginProps
    setFormData: (formData: visitorAccountProps | visitorLoginProps) => void
    errors: visitorAccountErrorProps | visitorLoginErrorProps
    setErrors: (errors: visitorAccountErrorProps | visitorLoginErrorProps) => void
    passwordConfirmation: string
    setPasswordConfirmation: (password: string) => void
    disableButton: boolean
    onSubmit: (e: React.FormEvent) => void
}


const VisitorForm = ({ createAccount, setCreateAccount, formData, setFormData, errors, setErrors, disableButton, onSubmit, passwordConfirmation, setPasswordConfirmation }: VisitorFormProps) => {
    const [passwordIsVisible, setPassswordIsVisible] = useState<boolean>(false)

    useEffect(() => {
        if (!createAccount) setPasswordConfirmation('')
    }, [createAccount])

    if (!formData) throw new Error()

    return (
        <form className={styles.visitorForm} onSubmit={onSubmit}>
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
                                value={'first_name' in formData ? formData.first_name : ''}
                                error={'first_name' in errors ? errors.first_name : null}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                onBlur={() => setErrors({ ...errors, first_name: validateName('first_name' in formData ? formData.first_name : '') })}
                            />
                        </label>
                        <label className={styles.label}>
                            Sobrenome
                            <CustomInput
                                type="text"
                                max={30}
                                value={'last_name' in formData ? formData.last_name : ''}
                                error={'last_name' in errors ? errors.last_name : null}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                onBlur={() => setErrors({ ...errors, last_name: validateName('last_name' in formData ? formData.last_name : '') })}
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
                createAccount && 'passwordConfirmation' in errors ? (
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