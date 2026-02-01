import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import CustomLoading from '../../customLoading/CustomLoading';
import styles from '../Table.module.css'
import search from '../../../assets/search-alt-svgrepo-com.svg';
import editIcon from '../../../assets/edit-3-svgrepo-com.svg'
import check from '../../../assets/check-svgrepo-com.svg'
import x from '../../../assets/close-svgrepo-com.svg'
import { useNavigate } from 'react-router-dom';

interface CRUDActions {
    canView: boolean
    canEdit: boolean
    onDelete?: (id: string) => void
}

interface DualActions {
    onApprove: (obj: Record<string, any>) => void
    onDecline: (id: string) => void
}

interface TableProps {
    itemList: Record<string, any>[];
    next: number | null
    previous: number | null
    setCurrent: Dispatch<SetStateAction<number>>
    current: number
    loadingContent: boolean
    translations: Record<string, string>;
    crudActions?: CRUDActions
    dualActions?: DualActions
    fetchData: (page: number, param: string) => void
    searchParam?: string
}

const Table = ({
    itemList,
    next,
    previous,
    setCurrent,
    loadingContent,
    translations,
    crudActions,
    dualActions,
    current,
    fetchData,
    searchParam
}: TableProps) => {

    void current
    void fetchData
    void searchParam

    const redirect = useNavigate()
    const firstRef = useRef<HTMLTableRowElement | null>(null)
    const lastRef = useRef<HTMLTableRowElement | null>(null)

    const redirectAction = (itemId: string, action: string = '') => {
        redirect(`${itemId}/${action}`, { state: itemId })
    }

    const formatarData = (valor: any) => {
        if (!valor) return '-'
        if (typeof valor !== 'string') return valor

        const isoDatetimeRegex =
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (isoDatetimeRegex.test(valor)) {
            const date = new Date(valor)
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('pt-BR')
            }
        }

        if (isoDateRegex.test(valor)) {
            const date = new Date(`${valor}T00:00:00`)
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('pt-BR')
            }
        }

        return valor
    }

    useEffect(() => {
        if (!firstRef.current || !lastRef.current) return

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target === lastRef.current && next && !loadingContent) {
                        setCurrent(next)
                    }

                    if (entry.target === firstRef.current && previous && !loadingContent) {
                        setCurrent(previous)
                    }
                }
            })
        }, { threshold: 0.5 })

        observer.observe(firstRef.current)
        observer.observe(lastRef.current)

        return () => observer.disconnect()
    }, [itemList, next, previous])

    return (
        <div className={styles.tableContainer}>
            {loadingContent && (
                <div
                    className={styles.loadingTable}
                    style={{
                        backgroundColor:
                            itemList.length === 0
                                ? 'transparent'
                                : 'rgba(0,0,0,0.3)'
                    }}
                >
                    <div className={styles.loadingContainer}>
                        <CustomLoading color="white" />
                    </div>
                </div>
            )}

            {itemList.length === 0 && !loadingContent ? (
                <div className={styles.messageContainer}>
                    <p className={styles.message}>
                        Não há resultados para serem mostrados
                    </p>
                </div>
            ) : (
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr className={styles.tr}>
                            {Object.keys(itemList[0] ?? {}).map(key =>
                                key !== 'id' ? (
                                    <th key={key} className={styles.th}>
                                        {translations[key] ?? key}
                                    </th>
                                ) : null
                            )}

                            {(crudActions || dualActions) && (
                                <th className={styles.thAction}>Ações</th>
                            )}
                        </tr>
                    </thead>

                    <tbody className={styles.tbody}>
                        {itemList.map((item, index) => (
                            <tr
                                key={item.id}
                                className={styles.tr}
                                ref={
                                    index === 0
                                        ? firstRef
                                        : index === itemList.length - 1
                                            ? lastRef
                                            : null
                                }
                            >
                                {Object.entries(item).map(([key, value]) =>
                                    key !== 'id' ? (
                                        <td key={key} className={styles.td}>
                                            {formatarData(value)}
                                        </td>
                                    ) : null
                                )}

                                <td className={styles.tdAction}>
                                    <div className={styles.actions}>
                                        {crudActions ? (
                                            <>
                                                {crudActions.canView && (
                                                    <img
                                                        src={search}
                                                        alt="detalhes"
                                                        className={styles.action}
                                                        onClick={() =>
                                                            redirectAction(item.id)
                                                        }
                                                    />
                                                )}

                                                {crudActions.canEdit && (
                                                    <img
                                                        src={editIcon}
                                                        alt="editar"
                                                        className={styles.action}
                                                        onClick={() =>
                                                            redirectAction(item.id, 'edit')
                                                        }
                                                    />
                                                )}
                                            </>
                                        ) : dualActions ? (
                                            <>
                                                <img
                                                    src={check}
                                                    alt="aprovar"
                                                    className={styles.action}
                                                    onClick={() =>
                                                        dualActions.onApprove(item)
                                                    }
                                                />
                                                <img
                                                    src={x}
                                                    alt="rejeitar"
                                                    className={styles.action}
                                                    onClick={() =>
                                                        dualActions.onDecline(item.id)
                                                    }
                                                />
                                            </>
                                        ) : null}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default Table
