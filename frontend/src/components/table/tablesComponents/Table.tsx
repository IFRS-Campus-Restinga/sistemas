import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import CustomLoading from '../../customLoading/CustomLoading';
import styles from '../Table.module.css'
import search from '../../../assets/search-alt-svgrepo-com.svg';
import deleteIcon from '../../../assets/delete-svgrepo-com.svg';
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
    fetchData: (page:  number, param: string) => void
    searchParam?: string
}

const Table = ({ itemList, next, previous, translations, setCurrent, current, loadingContent, crudActions, dualActions, fetchData, searchParam }: TableProps) => {
    const redirect = useNavigate()
    const firstRef = useRef(null)
    const lastRef = useRef(null)
    const loadingRef = useRef(false);


    const redirectAction = (itemId: string, action: string = '') => {
        redirect(`${itemId}/${action}`, {state: itemId})
    }

    const openModal = (id: string) => {

    }

    useEffect(() => {
        if (!lastRef.current) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && next && !loadingContent) {
                    setCurrent(prev => prev + 1);
                }
            });
        }, { threshold: 1.0 });

        observer.observe(lastRef.current);

        return () => {
            observer.disconnect();
        };
    }, [itemList, next, loadingContent]);

    useEffect(() => {
        if (current > 1) fetchData(current, searchParam ?? '');
    }, [current]);

    return (
        <div className={styles.tableContainer}>
            {
                loadingContent ? (
                    <div className={styles.loadingTable}>
                        <div className={styles.loadingContainer}>
                            <CustomLoading color='white' />
                        </div>
                    </div>
                ) : null
            }
            {
                itemList.length > 0 ? (
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr className={styles.tr}>
                            {
                                Object.keys(itemList[0]).map((key) => (
                                    key !== 'id' ? (
                                        <th key={key} className={styles.th}>{translations[key] ?? key}</th>
                                    ): null
                                ))
                            }
                            {(crudActions || dualActions) && <th className={styles.th}>Ações</th>}
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {
                                itemList.map((item, index) => (
                                    <tr 
                                        key={item.id}
                                        className={styles.tr}
                                        ref={index === itemList.length - 1 ? lastRef : null}
                                    >
                                        {
                                            Object.entries(item).map(([key, value]) => {
                                                if (key === "id") return null;

                                                // Detecta automaticamente se é uma data válida
                                                if (value) {
                                                const date = new Date(value);
                                                if (!isNaN(date.getTime()) && typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
                                                    value = date.toLocaleDateString("pt-BR"); // converte para DD/MM/YYYY
                                                }
                                                }

                                                return (
                                                <td key={key} className={styles.td}>
                                                    {value}
                                                </td>
                                                );
                                            })
                                        }
                                        <td className={styles.tdAction}>
                                            <div className={styles.actions}>
                                                {crudActions ? (
                                                    <>
                                                        {crudActions.canView && (
                                                            <img
                                                                src={search}
                                                                alt="detalhes"
                                                                className={styles.action}
                                                                onClick={() => redirectAction(item.id)}
                                                            />
                                                        )}

                                                        {crudActions.canEdit && (
                                                            <img
                                                                src={editIcon}
                                                                alt="editar"
                                                                className={styles.action}
                                                                onClick={() => redirectAction(item.id, 'edit')}
                                                            />
                                                        )}

                                                        {typeof crudActions.onDelete === 'function' && (
                                                            <img
                                                                src={deleteIcon}
                                                                alt="excluir"
                                                                className={styles.action}
                                                                onClick={() => openModal(item.id)}
                                                            />
                                                        )}
                                                    </>
                                                ) : dualActions ? (
                                                    <>
                                                        <img
                                                            src={check}
                                                            alt="aprovar"
                                                            className={styles.action}
                                                            onClick={() => dualActions.onApprove(item)}
                                                        />
                                                        <img
                                                            src={x}
                                                            alt="rejeitar"
                                                            className={styles.action}
                                                            onClick={() => dualActions.onDecline(item.id)}
                                                        />
                                                    </>
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.messageContainer}>
                        <p className={styles.message}>Não há resultados para serem mostrados</p>
                    </div>
                )
            }
        </div>
    )
}

export default Table