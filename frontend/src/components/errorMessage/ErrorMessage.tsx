import styles from './ErrorMessage.module.css'

interface ErrorMessageProps {
    message?: string | null
    align?: 'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'match-parent'
}

const ErrorMessage = ({message, align}: ErrorMessageProps) => {

    return (
        message !== null ? (
            <p className={styles.errorMessage} style={{textAlign: align ?? 'left'}}>{message}</p>
        ) : null    
    )
}

export default ErrorMessage