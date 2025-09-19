import ErrorMessage from '../errorMessage/ErrorMessage'
import styles from './CustomInput.module.css'

interface CustomInputProps {
    value: string
    error?: string | null
    type: string
    onChange: (e: any) => void
    onBlur?: (e?: any) => void
    onKeyDown?: (e?: React.KeyboardEvent) => void
    min?: number | string
    max?: number | string
    placeholder?: string
    maxLength?: number
    disabled?: boolean
}

const CustomInput = ({ value, error, type, min, max, onBlur, onChange, placeholder, onKeyDown, maxLength, disabled }: CustomInputProps) => {

    return (
        <div className={styles.inputContainer}>
            <input 
                className={error ? styles.errorInput : styles.input} 
                type={type} 
                value={value} 
                min={min} 
                onBlur={onBlur} 
                onChange={onChange} 
                max={max}
                maxLength={maxLength}
                placeholder={placeholder}
                onKeyDown={onKeyDown}
                disabled={disabled}
            />
            {
                <ErrorMessage message={error}/>
            }
        </div>
    )
}

export default CustomInput