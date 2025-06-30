import styles from './CustomLoading.module.css'

interface LoadingProps {
    color?: string
}

const CustomLoading = ({ color }: LoadingProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.loader} style={{ borderTop: `6px solid ${color ?? '#006b3f'}` }}></div>
        </div>
    )
}

export default CustomLoading
