import type { OptionProps } from '../customSelect/CustomSelect'
import styles from './CustomOptions.module.css'



interface CustomOptionsProps {
    options: OptionProps[]
    onSelect: (value: string) => void
}

const CustomOptions = ({ options, onSelect }: CustomOptionsProps) => {

    return (
        <ul className={styles.optionsContainer}>
            {
                options.map((option) => (
                    <li className={styles.customOption} onClick={() => onSelect(option.value)}>{option.title}</li>
                ))
            }
        </ul>
    )
}

export default CustomOptions