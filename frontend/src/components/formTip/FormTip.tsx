import { useState } from 'react'
import styles from './FormTip.module.css'

interface FormTipProps {
    tip: string
}

const FormTip = ({ tip }: FormTipProps) => {
    const [tipOpen, setTipOpen] = useState<boolean>(false)

    return (
        <span className={styles.tipContainer}>
            <div className={styles.tipIcon}
                onMouseEnter={() => setTipOpen(true)}
                onMouseLeave={() => setTipOpen(false)}
            >
                i
            </div>
            {
                tipOpen ? (
                    <div className={styles.tip}>
                        {tip}
                    </div>
                ) : null
            }
        </span>
    )
}

export default FormTip