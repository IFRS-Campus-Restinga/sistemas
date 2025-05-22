import styles from './CustomLoading.module.css'

const CustomLoading = () => {
    return (
        <div className={styles.container}>
            <div className={styles.loader}></div>
        </div>
    )
}

export default CustomLoading
