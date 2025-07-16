import { useState } from 'react'
import SystemForm from '../../../../features/systemForm/SystemForm'
import styles from './CreateSystem.module.css'
import { SystemService, type System } from '../../../../services/systemService'
import { toast, ToastContainer } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import FormContainer from '../../../../components/formContainer/FormContainer'
import { validateSystemForm } from '../../../../utils/validations/systemValidations'

export interface SystemFormErrors {
    name: string | null
    system_url: string | null
    dev_team: string | null
    secret_key: string |null
    groups: string | null
}

const CreateSystem = () => {
    const redirect = useNavigate()
    const [devTeamViewList, setDevTeamViewList] = useState<string[]>([])
    const [errorsSystemForm, setErrorsSystemForm] = useState<SystemFormErrors>({
        dev_team: null,
        name: null,
        system_url: null,
        secret_key: null,
        groups: null
    })
    const [systemForm, setSystemForm] = useState<System>({
        system_url: '',
        current_state: 'Em desenvolvimento',
        dev_team: [],
        is_active: false,
        name: '',
        secret_key: '',
        groups: []
    })

    const validateForm = () => {
        const errors = validateSystemForm(systemForm)

        setErrorsSystemForm(errors)

        return Object.values(errors).every((value) => value === null)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            const req = SystemService.create(systemForm)

            toast.promise(
                req,
                {
                    pending: "Cadastrando sistema...",
                    success: "Sistema cadastrado com sucesso!",
                    error: {
                        render({ data }: any) {
                            return data.message || 'Erro ao cadastrar'
                        }
                    } 
                }
            ).then(() => {
                setTimeout(() => {
                    redirect('/admin/home')
                }, 2000);
            })
        }
    }


    return (
        <section className={styles.systemFormContainer}>
            <ToastContainer/>
            <FormContainer
                title='Cadastro de Sistema' 
                formTip={"Preencha os campos obrigatórios (*)\n\nPesquise e adicione alunos à equipe de desenvolvimento do projeto\n\nAdicione grupos de acesso ao projeto usando o sinal de '+' na tabela dinâmica abaixo"}
            >
                <form className={styles.formContainer} onSubmit={handleSubmit}>
                    <SystemForm
                        devTeamViewList={devTeamViewList}
                        errors={errorsSystemForm}
                        formData={systemForm}
                        setDevTeamViewList={setDevTeamViewList}
                        setErrors={setErrorsSystemForm}
                        setFormData={setSystemForm}
                    />
                </form>
            </FormContainer>
        </section>
    )
}

export default CreateSystem