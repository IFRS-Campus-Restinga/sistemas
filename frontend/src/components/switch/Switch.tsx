import styles from './Switch.module.css'
import lockIcon from '../../assets/lock-filled-svgrepo-com.svg'

interface SwitchProps {
    value: string
    value1: string
    value2: string
    customImage?: string
    stateHandler: (value: string) => void
    width?: string
    disabled?: boolean
}

const Switch = ({value, stateHandler, value1, value2, customImage, width, disabled}: SwitchProps) => {
    let handleClick = () => {
        if (disabled) return
        const newValue = value === value1 ? value2 : value1;
        if (stateHandler) stateHandler(newValue);
      };

    return (
        <button
            type='button'
            className={value === value1 ? styles.button : styles.toggledBtn}
            onClick={handleClick}
            disabled={disabled}
            style={{ "--switch-width": width ?? "9rem" } as React.CSSProperties}
        >
            <p id={styles.text} className={value === value1 ? styles.btnText : styles.toggledBtnText}>
                {value === value1 ? value1 : value2}
            </p>
            <div className={value === value1? styles.slider : styles.toggledSlider}>
                {disabled ? <img src={lockIcon} alt="bloqueado" className={styles.lockIcon} /> : customImage}
            </div>
        </button>
    )
}

export default Switch