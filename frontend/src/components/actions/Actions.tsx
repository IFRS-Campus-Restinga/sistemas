import { useState } from 'react'
import styles from './Actions.module.css'

interface ActionProps {
    seeActionsIcon: string
    collapseActionsIcon: string
    itemId: string
    onView?: (itemId: string) => void
    onEdit?: (itemId: string) => void
}

const Actions = ({seeActionsIcon, collapseActionsIcon, itemId, onEdit, onView}: ActionProps) => {
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
                                        setIsOpen(false)
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
                                        setIsOpen(false)
                                    }} 
                                    className={styles.actionItem}
                                >
                                    Editar
                                </li>
                            )}
                    </ul>    
                ) : null
            }
            
        </div>
    )
}

export default Actions