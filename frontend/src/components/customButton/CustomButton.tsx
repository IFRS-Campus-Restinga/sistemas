import styles from './CustomButton.module.css'

interface CustomButtonProps {
    text: string
    type: "submit" | "reset" | "button" | undefined
    onClick?: () => void
    disabled?: boolean
}

const CustomButton = ({ text, type, onClick, disabled }: CustomButtonProps) => {

    return (
        <button className={styles.button} type={type} onClick={onClick} disabled={disabled}>{text}</button>
    )
}

export default CustomButton