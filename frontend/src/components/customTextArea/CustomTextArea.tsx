import ErrorMessage from '../errorMessage/ErrorMessage'
import styles from './CustomTextArea.module.css'

interface CustomTextAreaProps {
    value: string
    error?: string | null
    onChange: (e: any) => void
    onBlur?: (e?: any) => void
    onKeyDown?: (e?: React.KeyboardEvent) => void
    placeholder?: string
    maxLength?: number
}

const CustomTextArea = ({ value, error, onBlur, onChange, placeholder, maxLength}: CustomTextAreaProps) => {

    return (
        <div className={styles.textAreaContainer}>
            <textarea 
                className={error ? styles.errorTextArea : styles.textArea} 
                value={value} 
                onBlur={onBlur} 
                onChange={onChange} 
                maxLength={maxLength}
                placeholder={placeholder}
            />
            {
                <ErrorMessage message={error}/>
            }
        </div>
    )
}

export default CustomTextArea