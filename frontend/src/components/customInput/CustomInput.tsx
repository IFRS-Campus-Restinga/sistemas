import styles from './CustomInput.module.css'

interface CustomInputProps {
    value: string
    error: string | null
    type: string
    onChange: (e: any) => void
    onBlur: (e?: any) => void
    min?: number
    max?: number
}

const CustomInput = ({ value, error, type, min, max, onBlur, onChange }: CustomInputProps) => {

    return (
        <div className={styles.inputContainer}>
            <input className={error ? styles.errorInput : styles.input} type={type} value={value} min={min} onBlur={onBlur} onChange={onChange} max={max} />
            {
                error !== null ? (
                    <p className={styles.errorMessage}>{error}</p>
                ) : null
            }
        </div>
    )
}

export default CustomInput