import { useEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import FormContainer from '../../components/formContainer/FormContainer'
import CustomInput from '../../components/customInput/CustomInput'
import CustomLabel from '../../components/customLabel/CustomLabel'
import CustomLoading from '../../components/customLoading/CustomLoading'
import tableStyles from '../../components/table/Table.module.css'
import GroupService from '../../services/groupService'
import PermissionService, { type Permissions } from '../../services/permissionService'
import styles from './GroupDetails.module.css'

const GroupDetails = () => {
    const location = useLocation()
    const { groupId } = useParams()
    const id = location.state ?? groupId
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [nextPermissionPage, setNextPermissionPage] = useState<number | null>(null)
    const [hasPermissionLoadError, setHasPermissionLoadError] = useState(false)
    const [groupName, setGroupName] = useState('')
    const [permissions, setPermissions] = useState<Permissions[]>([])
    const permissionTableContainerRef = useRef<HTMLDivElement>(null)
    const permissionListEndRef = useRef<HTMLTableRowElement>(null)
    const isLoadingMoreRef = useRef(false)
    const currentGroupIdRef = useRef<string | undefined>(undefined)

    useEffect(() => {
        let isCurrentGroup = true
        currentGroupIdRef.current = id
        isLoadingMoreRef.current = false
        setIsLoadingMore(false)

        const fetchData = async () => {
            if (!id) {
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            setPermissions([])
            setNextPermissionPage(null)
            setHasPermissionLoadError(false)

            try {
                const [groupResponse, permissionsResponse] = await Promise.all([
                    GroupService.get(id, 'id, name'),
                    PermissionService.listByGroup(id, 1, 'id, name')
                ])

                if (!isCurrentGroup) return

                setGroupName(groupResponse.data.name)
                setPermissions(permissionsResponse.data.results ?? [])
                setNextPermissionPage(permissionsResponse.data.next ? 2 : null)
            } catch (error) {
                if (!isCurrentGroup) return

                if (error instanceof AxiosError) {
                    toast.error(error.response?.data.message)
                } else {
                    console.error(error)
                }
            } finally {
                if (isCurrentGroup) {
                    setIsLoading(false)
                }
            }
        }

        fetchData()

        return () => {
            isCurrentGroup = false
            if (currentGroupIdRef.current === id) {
                currentGroupIdRef.current = undefined
            }
        }
    }, [id])

    useEffect(() => {
        const tableContainer = permissionTableContainerRef.current
        const endOfList = permissionListEndRef.current
        if (
            !tableContainer
            || !endOfList
            || !id
            || !nextPermissionPage
            || isLoading
            || isLoadingMore
            || hasPermissionLoadError
        ) {
            return
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting || isLoadingMoreRef.current) return

            isLoadingMoreRef.current = true
            setIsLoadingMore(true)

            PermissionService.listByGroup(id, nextPermissionPage, 'id, name')
                .then((response) => {
                    if (currentGroupIdRef.current !== id) return

                    setPermissions((current) => [
                        ...current,
                        ...(response.data.results ?? [])
                    ])
                    setNextPermissionPage(
                        response.data.next ? nextPermissionPage + 1 : null
                    )
                })
                .catch((error) => {
                    if (currentGroupIdRef.current !== id) return

                    setHasPermissionLoadError(true)
                    if (error instanceof AxiosError) {
                        toast.error(error.response?.data.message)
                    } else {
                        console.error(error)
                    }
                })
                .finally(() => {
                    if (currentGroupIdRef.current !== id) return

                    isLoadingMoreRef.current = false
                    setIsLoadingMore(false)
                })
        }, {
            root: tableContainer,
            threshold: 0
        })

        observer.observe(endOfList)
        return () => observer.disconnect()
    }, [
        hasPermissionLoadError,
        id,
        isLoading,
        isLoadingMore,
        nextPermissionPage
    ])

    return (
        <FormContainer title="Detalhes do Grupo">
            {isLoading ? (
                <CustomLoading />
            ) : (
                <section className={styles.content}>
                    <CustomLabel title="Nome">
                        <CustomInput type="text" value={groupName} onChange={() => {}} disabled />
                    </CustomLabel>
                    <div className={styles.permissionsSection}>
                        <h3>Permissões do grupo</h3>
                        {permissions.length > 0 ? (
                            <div
                                ref={permissionTableContainerRef}
                                className={tableStyles.tableContainer}
                            >
                                <table className={tableStyles.table}>
                                    <thead className={tableStyles.thead}>
                                        <tr className={tableStyles.tr}>
                                            <th className={tableStyles.th}>Permissão</th>
                                        </tr>
                                    </thead>
                                    <tbody className={tableStyles.tbody}>
                                        {permissions.map((permission) => (
                                            <tr key={permission.id} className={tableStyles.tr}>
                                                <td className={tableStyles.td}>
                                                    {permission.name}
                                                </td>
                                            </tr>
                                        ))}
                                        {nextPermissionPage && (
                                            <tr
                                                ref={permissionListEndRef}
                                                className={tableStyles.tr}
                                            >
                                                <td className={tableStyles.td}>
                                                    {isLoadingMore && <CustomLoading />}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className={styles.emptyMessage}>Nenhuma permissão vinculada</p>
                        )}
                    </div>
                </section>
            )}
        </FormContainer>
    )
}

export default GroupDetails
