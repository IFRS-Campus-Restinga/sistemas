import styles from './BackButton.module.css'
import arrowIcon from '../../assets/arrow-up-svgrepo-white-com.svg'

interface BackButtonProps {
    onClick: () => void
}

const BackButton = ({ onClick }: BackButtonProps) => (
    <button className={styles.button} onClick={onClick} type="button" aria-label="Voltar">
        <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="none" stroke="#767676" strokeWidth="2"/>
            <image href={arrowIcon} x="8" y="8" width="24" height="24" className={styles.arrow}/>
        </svg>
    </button>
)

export default BackButton
