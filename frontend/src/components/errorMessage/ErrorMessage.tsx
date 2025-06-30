import styles from './ErrorMessage.module.css'

interface ErrorMessageProps {
    message?: string | null
}

const ErrorMessage = ({message}: ErrorMessageProps) => {

    return (
        message !== null ? (
            <p className={styles.errorMessage}>{message}</p>
        ) : null    
    )
}

export default ErrorMessage