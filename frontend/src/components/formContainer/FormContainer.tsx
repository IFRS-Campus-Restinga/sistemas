import FormTip from '../formTip/FormTip'
import styles from './FormContainer.module.css'

interface FormContainerProps {
    title: string
    formTip?: string
    children: React.ReactNode
    width?: string
}

const FormContainer = ({ title, formTip, children, width }: FormContainerProps) => {

    return (
        <section className={styles.section} style={{width: width}}>
            <div className={styles.formHeader}>
                <h2 className={styles.title}>{title}</h2>
                {
                    formTip ? (
                        <FormTip tip={formTip} />
                    ) : null
                }
            </div>
            <hr className={styles.formLine} />
            <div className={styles.formContainer}>
                {children}
            </div>
        </section>
    )
}

export default FormContainer