import { useState } from 'react'
import CustomInput from '../customInput/CustomInput'
import CustomLabel from '../customLabel/CustomLabel'
import styles from './SystemForm.module.css'
import { validateMandatoryStringField } from '../../utils/generalValidations'
import CustomSelect from '../customSelect/CustomSelect'
import FormContainer from '../formContainer/FormContainer'

interface SystemFormProps {
    name: string
    app_url: string
    is_active: boolean
    current_state: string
    dev_team: String[]
}

interface SystemFormErrorProps {
    name: string | null
    app_url: string | null
    is_active: string | null
    current_state: string | null
    dev_team: string | null
}

const SystemForm = () => {
    const [formData, setFormData] = useState<SystemFormProps>({
        app_url: '',
        current_state: '',
        dev_team: [],
        is_active: false,
        name: ''
    })
    const [errors, setErrors] = useState<SystemFormErrorProps>({
        app_url: null,
        current_state: null,
        dev_team: null,
        is_active: null,
        name: null
    })

    return (
        <FormContainer title='Cadastro de Sistema' formTip={"Preencha os campos obrigatórios (*) \n\n Pesquise e vincule alunos do curso de DEV II à equipe de desenvolvimento do sistema."}>
            <form className={styles.form}>
                <div className={styles.formGroup}>
                    <CustomLabel title='Nome'>
                        <CustomInput
                            type='text'
                            value={formData.name}
                            max={50}
                            error={errors.name}
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value })
                            }}
                            onBlur={() => {
                                setErrors({ ...errors, name: validateMandatoryStringField(formData.name) })
                            }}
                        />
                    </CustomLabel>
                </div>
                <div className={styles.formGroup}>
                    <CustomLabel title='URL / Domínio do sistema '>
                        <CustomInput
                            type='text'
                            value={formData.app_url}
                            max={255}
                            error={errors.app_url}
                            onChange={(e) => {
                                setFormData({ ...formData, app_url: e.target.value })
                            }}
                            onBlur={() => {
                                setErrors({ ...errors, app_url: validateMandatoryStringField(formData.app_url) })
                            }}
                        />
                    </CustomLabel>
                </div>
                <div className={styles.formGroup}>
                    <CustomLabel title='URL / Domínio do sistema '>
                        <CustomSelect
                            value={formData.current_state}
                            onChange={(e) => setFormData({ ...formData, current_state: e.target.value })}
                            options={[
                                {
                                    title: 'Em desenvolvimento',
                                    value: 'Em desenvolvimento',
                                },
                                {
                                    title: 'Implantado',
                                    value: 'Implantado',
                                },
                            ]}
                        />
                    </CustomLabel>
                </div>
                <div className={styles.formGroup}>
                    <CustomLabel title='URL / Domínio do sistema '>
                        <CustomInput
                            type='text'
                            value={formData.app_url}
                            max={255}
                            error={errors.app_url}
                            onChange={(e) => {
                                setFormData({ ...formData, app_url: e.target.value })
                            }}
                            onBlur={() => {
                                setErrors({ ...errors, app_url: validateMandatoryStringField(formData.app_url) })
                            }}
                        />
                    </CustomLabel>
                </div>
            </form>
        </FormContainer>
    )
}

export default SystemForm