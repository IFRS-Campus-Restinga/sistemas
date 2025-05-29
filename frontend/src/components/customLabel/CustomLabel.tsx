import styles from './CustomLabel.module.css'

interface CustomLabelProps {
    children: React.ReactNode
    title: string
}

const CustomLabel = ({ title, children }: CustomLabelProps) => {

    return (
        <label className={styles.label}>
            {title}
            {children}
        </label>
    )
}

export default CustomLabel