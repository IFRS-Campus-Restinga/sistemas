import { useState } from 'react'
import styles from './Actions.module.css'
import view from '../../assets/eye-show-svgrepo-com-gray.svg'
import edit from '../../assets/edit-3-svgrepo-com.svg'
import remove from '../../assets/delete-svgrepo-com.svg'

interface ActionProps {
    iconSrc: string
    itemId: string
    onView?: (itemId: string) => void
    onEdit?: (itemId: string) => void
    onDelete?: (itemId: string) => void
}

const Actions = ({iconSrc, itemId, onDelete, onEdit, onView}: ActionProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const handleBlur = () => {
        setTimeout(() => setIsOpen(false), 100)
    }

    return (
        <div className={styles.actionsContainer}>
            <img 
                src={iconSrc} 
                alt="" 
                onBlur={handleBlur}
                className={styles.actionsIcon} 
                onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen((prev) => !prev)
                }
            }/>
            {
                isOpen ? (
                   <ul className={styles.actionsList}>
                        {onView && (
                            <li 
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onView(itemId)
                                }} 
                                className={styles.actionItem}
                            >
                                Visualizar
                                <img src={view} alt="" className={styles.actionIcon}/>
                            </li>
                        )}
                        {onEdit && (
                            <li 
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit(itemId)
                                }} 
                                className={styles.actionItem}
                            >
                                Editar
                                <img src={edit} alt="" className={styles.actionIcon}/>
                            </li>
                        )}
                        {onDelete && (
                            <li 
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(itemId)
                                }} 
                                className={styles.actionItem}
                            >
                                Excluir
                                <img src={remove} alt="" className={styles.actionIcon}/>
                            </li>
                        )}
                    </ul>    
                ) : null
            }
        </div>
    )
}

export default Actions