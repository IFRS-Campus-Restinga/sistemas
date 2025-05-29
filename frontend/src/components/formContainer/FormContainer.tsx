import FormTip from '../formTip/FormTip'
import styles from './FormContainer.module.css'

interface FormContainerProps {
    title: string
    formTip: string
    children: React.ReactNode
}

const FormContainer = ({ title, formTip, children }: FormContainerProps) => {

    return (
        <section className={styles.section}>
            <div className={styles.formHeader}>
                <h2>{title}</h2>
                <FormTip tip={formTip} />
            </div>
            <hr className={styles.formLine} />
            <div className={styles.formContainer}>
                {children}
            </div>
        </section>
    )
}

export default FormContainer