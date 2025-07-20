import styles from './Switch.module.css'

interface SwitchProps {
    value: string 
    value1: string 
    value2: string 
    customImage?: string
    stateHandler: (value: string) => void
}

const Switch = ({value, stateHandler, value1, value2, customImage}: SwitchProps) => {
    let handleClick = () => {
        const newValue = value === value1 ? value2 : value1;
        if (stateHandler) stateHandler(newValue);
      };

    return (
        <button type='button' className={value === value1 ? styles.button : styles.toggledBtn} onClick={handleClick}>
            <p id={styles.text} className={value === value1 ? styles.btnText : styles.toggledBtnText}>
                {value === value1 ? value1 : value2}
            </p>
            <div className={value === value1? styles.slider : styles.toggledSlider}>
                {customImage}
            </div>
        </button>
    )
}

export default Switch