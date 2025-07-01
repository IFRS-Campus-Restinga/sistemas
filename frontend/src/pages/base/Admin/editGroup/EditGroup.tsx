import { useLocation } from 'react-router-dom'
import styles from './EditGroup.module.css'
import { useEffect, useState } from 'react'
import GroupService, { type Group } from '../../../../services/groupService'
import FormContainer from '../../../../components/formContainer/FormContainer'
import { toast, ToastContainer } from 'react-toastify'
import PermissionService, {type Permissions} from '../../../../services/permission_service'
import DualTableTransfer from '../../../../components/dualTableTransfer/DualTableTransfer'
import CustomLoading from '../../../../components/customLoading/CustomLoading'
import CustomLabel from '../../../../components/customLabel/CustomLabel'
import CustomInput from '../../../../components/customInput/CustomInput'
import { validateMandatoryStringField } from '../../../../utils/validations/generalValidations'
import CustomButton from '../../../../components/customButton/CustomButton'

const EditGroup = () => {
    const location = useLocation()
    const { state } = location
    const [permissions, setPermissions] = useState<Permissions[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [nameError, setNameError] = useState<string | null>(null)
    const [group, setGroup] = useState<Group>({
        id: '',
        name: '',
        permissions: []
    })
    
    const fetchData = async () => {
        try {
            const res = await Promise.allSettled([
                GroupService.get(state),
                PermissionService.exclude(state)
            ])
            
            if (res[0].status === 'fulfilled') setGroup(res[0].value.data)
            if (res[1].status === 'fulfilled') setPermissions(res[1].value.data)
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message, {
                    autoClose: 2000,
                    position: 'bottom-center',
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    const validateForm = () => {
        let validated = true

        const error = validateMandatoryStringField(group.name)

        if (error) validated = false

        setNameError(error)
        return validated
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (validateForm()) {
            const req = GroupService.edit(group, state)

            toast.promise(
                req,
                {
                    pending: 'Salvando alterações...',
                    success: 'Registro atualizado com sucesso',
                    error: {
                        render({ data }: { data: any }) {
                            return data.message || 'Erro ao alterar dados'
                        }
                    }
                }
            )
        }
    }

    useEffect(() => {
        fetchData()
    }, [state])

    return (
        <FormContainer title='Editar Grupo' formTip={"Preencha os campos obrigatórios (*)\n\nVincule ou Desvincule permissões ao grupo utilizando as tabelas abaixo."}>
            <ToastContainer/>
            {
                isLoading ? (
                    <CustomLoading/>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <CustomLabel title='Nome *'>
                                <CustomInput
                                    type='text'
                                    value={group.name}
                                    onBlur={() => setNameError(validateMandatoryStringField(group.name))}
                                    onChange={(e) => setGroup({...group, name: e.target.value})}
                                    error={nameError}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.tablesContainer}>
                            <DualTableTransfer
                                title1="Permissões disponíveis"
                                title2="Permissões do grupo"
                                list1={permissions}
                                list2={group.permissions}
                                setList1={setPermissions}
                                setList2={(newList) =>
                                    setGroup((prev) => ({ ...prev, permissions: newList }))
                                }
                                getKey={(perm) => perm.id}
                                renderItem={(perm) => perm.name}
                            />
                        </div>
                        <div className={styles.buttonContainer}>
                            <CustomButton text='Salvar Alterações' type='submit'/>
                        </div>
                    </form>
                )
            }
        </FormContainer>    
    )
}

export default EditGroup