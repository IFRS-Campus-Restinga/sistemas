import type { OptionProps } from '../customSelect/CustomSelect'
import styles from './CustomOptions.module.css'

interface CustomOptionsProps {
    options: OptionProps<'id'>[]
    onSelect: (option: OptionProps<'id'>) => void
}

const CustomOptions = ({ options, onSelect }: CustomOptionsProps) => {
    return (
        <ul className={styles.optionsContainer}>
            {
                options.map((option) => (
                    <li className={styles.customOption} onClick={() => onSelect(option)}>{option.title}</li>
                ))
            }
        </ul>
    )
}

export default CustomOptions