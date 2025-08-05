import { useLocation } from 'react-router-dom'
import styles from './GroupForm.module.css'
import { useEffect, useState } from 'react'
import GroupService, { type Group } from '../../../../services/groupService'
import FormContainer from '../../../../components/formContainer/FormContainer'
import { toast, ToastContainer } from 'react-toastify'
import PermissionService, {type Permissions} from '../../../../services/permissionService'
import DualTableTransfer from '../../../../components/table/tablesComponents/DualTableTransfer'
import CustomLoading from '../../../../components/customLoading/CustomLoading'
import CustomLabel from '../../../../components/customLabel/CustomLabel'
import CustomInput from '../../../../components/customInput/CustomInput'
import { validateMandatoryStringField } from '../../../../utils/validations/generalValidations'
import CustomButton from '../../../../components/customButton/CustomButton'

const GroupForm = () => {
    const location = useLocation()
    const { state } = location
    const [pageList1, setPageList1] = useState<number>(1)
    const [pageList2, setPageList2] = useState<number>(1)
    const [nextPageList1, setNextPageList1] = useState<number | null>(null)
    const [prevPageList1, setPrevPageList1] = useState<number | null>(null)
    const [nextPageList2, setNextPageList2] = useState<number | null>(null)
    const [prevPageList2, setPrevPageList2] = useState<number | null>(null)
    // permissões disponíveis
    const [availablePermissions, setAvailablePermissions] = useState<Permissions[]>([])
    // permissões do grupo
    const [groupPermissions, setGroupPermissions] = useState<Permissions[]>([])
    // permissões a serem adicionadas ao grupo
    const [permissionsToAdd, setPermissionsToAdd] = useState<Permissions[]>([])
    // permissões a serem removidas do grupo
    const [permissionsToRemove, setPermissionsToRemove] = useState<Permissions[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isLoadingPermissions, setIsLoadingAvailablePermissions] = useState<boolean>(true)
    const [isLoadingGroupPermissions, setIsLoadingGroupPermissions] = useState<boolean>(true)
    const [nameError, setNameError] = useState<string | null>(null)
    const [group, setGroup] = useState<Group>({
        id: '',
        name: '',
    })
    
    const fetchGroupData = async () => {
        try {
            const res = await Promise.all([
                GroupService.get(state),
                PermissionService.notAssignedTo(state, pageList1),
                PermissionService.listByGroup(state, pageList2)
            ])

            setGroup(res[0].data)
            setAvailablePermissions(res[1].data.results)
            setGroupPermissions(res[2].data.results)

            setNextPageList1(res[1].data.next ? pageList1 + 1 : null)
            setPrevPageList1(res[1].data.prev ? pageList1 - 1 : null)

            setNextPageList2(res[2].data.next ? pageList2 + 1 : null)
            setPrevPageList2(res[2].data.prev ? pageList2 - 1 : null)
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message, {
                    autoClose: 2000,
                    position: 'bottom-center',
                })
            }
        } finally {
            setIsLoading(false)
            setIsLoadingAvailablePermissions(false)
            setIsLoadingGroupPermissions(false)
        }
    }

    const fetchGroupPermissions = async () => {
        setIsLoadingGroupPermissions(true)

        if (state) {
            try {
                const res =  await PermissionService.listByGroup(state, pageList2)

                setGroupPermissions([...groupPermissions, ...res.data.results])

                setNextPageList2(res.data.next ? pageList2 + 1 : null)
                setPrevPageList2(res.data.previous ? pageList2 - 1 : null)
            } catch (error) {
                console.log()
            } finally {
                setIsLoadingGroupPermissions(false)
            }
        }
    }

    const fetchAvailablePermissions = async () => {
        setIsLoadingAvailablePermissions(true)

        try {
            const res = await PermissionService.notAssignedTo(state, pageList1)

            setAvailablePermissions((prev) => [...prev, ...res.data.results])

            setNextPageList1(res.data.next ? pageList1 + 1 : null)
            setPrevPageList1(res.data.previous ? pageList1 - 1 : null)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
            setIsLoadingAvailablePermissions(false)
            setIsLoadingGroupPermissions(false)
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
            let req

            if (state) req = GroupService.edit(
                {
                    id: state, 
                    name: group.name, 
                    permissionsToAdd: permissionsToAdd,
                    permissionsToRemove: permissionsToRemove
                }, state)
            else req = GroupService.create(
                {
                    id: state, 
                    name: group.name, 
                    permissionsToAdd: permissionsToAdd,
                    permissionsToRemove: permissionsToRemove
                }
            )

            toast.promise(
                req,
                {
                    pending: state ? 'Salvando alterações...' : 'Criando grupo...',
                    success: state ? 'Registro atualizado com sucesso' : 'Grupo criado com sucesso',
                    error: {
                        render({ data }: { data: any }) {
                            return data.message || 'Erro ao alterar dados'
                        }
                    }
                },
                {
                    autoClose: 2000,
                    position: 'bottom-center'
                }
            )
        }
    }

    const setGroupPermissionsDisplay = (newPermissions: React.SetStateAction<Permissions[]>) => {
        setGroupPermissions(groupPermissions => {
            // Se newPermissions for função, chama ela com groupPermissions para obter o novo array
            const updatedPermissions = typeof newPermissions === 'function'
            ? (newPermissions as (prev: Permissions[]) => Permissions[])(groupPermissions)
            : newPermissions

            return updatedPermissions
        })
    }

    const addPermission = (perm: Permissions) => {
        setPermissionsToAdd([...permissionsToAdd, perm])
        setPermissionsToRemove(permissionsToRemove.filter((p) => p.id !== perm.id))
    }

    const removePermission = (perm: Permissions) => {
        setPermissionsToRemove([...permissionsToRemove, perm])
        setPermissionsToAdd(permissionsToAdd.filter((p) => p.id !== perm.id))
    }

    useEffect(() => {
        if (state) {
            fetchGroupData()  
        } else {
            fetchAvailablePermissions()
        }
    }, [state])

    return (
        <FormContainer title={`${state ? 'Editar' : 'Cadastrar'} Grupo`} formTip={"Preencha os campos obrigatórios (*)\n\nVincule ou Desvincule permissões ao grupo utilizando as tabelas abaixo."}>
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
                            <DualTableTransfer
                                title1="Permissões disponíveis"
                                title2="Permissões do grupo"
                                list1={availablePermissions}
                                list2={groupPermissions}
                                setList1={setAvailablePermissions}
                                setList2={setGroupPermissionsDisplay}
                                callbackList1={(perm) => addPermission(perm)}
                                callbackList2={(perm) => removePermission(perm)}
                                currentList1={pageList1}
                                currentList2={pageList2}
                                nextList1={nextPageList1}
                                nextList2={nextPageList2}
                                prevList1={prevPageList1}
                                prevList2={prevPageList2}
                                fetchData1={fetchAvailablePermissions}
                                fetchData2={fetchGroupPermissions}
                                loadingList1={isLoadingPermissions}
                                loadingList2={isLoadingGroupPermissions}
                                setCurrentList1={setPageList1}
                                setCurrentList2={setPageList2}
                                getKey={(perm) => perm.id}
                                renderItem={(perm) => perm.name}
                            />
                        <div className={styles.buttonContainer}>
                            <CustomButton text='Salvar Alterações' type='submit'/>
                        </div>
                    </form>
                )
            }
        </FormContainer>    
    )
}

export default GroupForm