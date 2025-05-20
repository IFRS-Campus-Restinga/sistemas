import styles from './CustomButton.module.css'

interface CustomButtonProps {
    text: string
    type: "submit" | "reset" | "button" | undefined
    onClick?: () => void
}

const CustomButton = ({ text, type, onClick }: CustomButtonProps) => {

    return (
        <button className={styles.button} type={type} onClick={onClick}>{text}</button>
    )
}

export default CustomButton