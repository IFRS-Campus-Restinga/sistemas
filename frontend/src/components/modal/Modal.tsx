import styles from './Modal.module.css'
import close from '../../assets/close-svgrepo-com.svg'

interface ModalProps {
    setIsOpen: (isOpen: boolean) => void
    children: React.ReactNode
}

const Modal = ({setIsOpen, children}: ModalProps) => {

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <img src={close} alt="" className={styles.close} onClick={() => setIsOpen(false)}/>
                {children}
            </div>
        </section>
    )
}

export default Modal