import { useState } from 'react'
import styles from './Actions.module.css'

interface ActionProps {
    seeActionsIcon: string
    collapseActionsIcon: string
    itemId: string
    onView?: (itemId: string) => void
    onEdit?: (itemId: string) => void
    onDelete?: (itemId: string) => void
}

const Actions = ({seeActionsIcon, collapseActionsIcon, itemId, onDelete, onEdit, onView}: ActionProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const handleBlur = () => {
        setTimeout(() => setIsOpen(false), 100)
    }

    return (
        <div className={styles.actionsContainer}>
            <img 
                src={isOpen ? collapseActionsIcon : seeActionsIcon} 
                alt="" 
                onBlur={handleBlur}
                className={styles.actionsIcon} 
                onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen((prev) => !prev)
                }}
            />
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
                                    Detalhes
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
                                    Remover
                                </li>
                            )}
                    </ul>    
                ) : null
            }
            
        </div>
    )
}

export default Actions