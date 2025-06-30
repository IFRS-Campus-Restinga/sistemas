import type { Dispatch, SetStateAction } from 'react';
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
    canDelete: boolean
}

const Table = ({ itemList, next, previous, setCurrent, current, loadingContent, canDelete, canEdit, canView }: TableProps) => {
    const redirect = useNavigate()

    const redirectAction = (itemId: string, action: string = '') => {
        redirect(`${itemId}/${action}`, {state: itemId})
    }


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