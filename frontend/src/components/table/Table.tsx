import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import CustomLoading from '../customLoading/CustomLoading';
import styles from './Table.module.css'
import search from '../../assets/search-alt-svgrepo-com.svg';
import deleteIcon from '../../assets/delete-svgrepo-com.svg';
import editIcon from '../../assets/edit-3-svgrepo-com.svg'
import { useNavigate } from 'react-router-dom';

interface TableProps {
    itemList: Record<string, any>[];
    next: number | null
    previous: number | null
    setCurrent: Dispatch<SetStateAction<number>>
    current: number
    loadingContent: boolean
    canView: boolean,
    canEdit: boolean,
    canDelete: boolean,
    fetchData: (page:  number, param: string) => void
}

const Table = ({ itemList, next, previous, setCurrent, current, loadingContent, canDelete, canEdit, canView, fetchData }: TableProps) => {
    const redirect = useNavigate()
    const firstRef = useRef(null)
    const lastRef = useRef(null)

    const redirectAction = (itemId: string, action: string = '') => {
        redirect(`${itemId}/${action}`, {state: itemId})
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
        if (current > 1) fetchData(current, '');
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
            <table className={styles.table}>
                <thead className={styles.thead}>
                    <tr className={styles.tr}>
                        {
                            Object.keys(itemList[0] ?? {}).map((itemKey) => (
                                itemKey !== 'id' ? (
                                    <th className={styles.th}>{itemKey}</th>
                                ) : null
                            ))
                        }
                        {
                            !canDelete && !canEdit && !canView ? null : (
                                <th className={styles.th}>
                                    Ações
                                </th>
                            ) 
                        }
                    </tr>
                </thead>
                <tbody className={styles.tbody}>
                    {
                        itemList.map((item) => (
                            <tr className={styles.tr}>
                                {
                                    Object.entries(item).map(([key, value]) => (
                                        key !== 'id' ? (
                                            <td className={styles.td}>
                                                {value}
                                            </td>
                                        ) : null
                                    ))
                                }
                                <td className={styles.td}>
                                    <div className={styles.actions}>
                                        {
                                            canView ? (
                                                <img src={search} alt="detalhes" className={styles.action} onClick={() => redirectAction(item.id)}/>
                                            ) : null
                                        }
                                        {
                                            canEdit ? (
                                                <img src={editIcon} alt="editar" className={styles.action} onClick={() => redirectAction(item.id, 'edit')}/>
                                            ) : null
                                        }
                                        {
                                            canDelete ? (
                                                <img src={deleteIcon} alt="excluir" className={styles.action} onClick={() => redirectAction(item.id, 'delete')}/>
                                            ) : null
                                        }
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
}

export default Table