import styles from './CustomButton.module.css'

interface CustomButtonProps {
    text: string
    type: "submit" | "reset" | "button" | undefined
    onClick?: () => void
    disabled?: boolean
    variant?: 'default' | 'gray'
}

const CustomButton = ({ text, type, onClick, disabled, variant = 'default' }: CustomButtonProps) => {

    return (
        <button className={variant === 'gray' ? styles.buttonGray : styles.button} type={type} onClick={onClick} disabled={disabled}>{text}</button>
    )
}

export default CustomButton