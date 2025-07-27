import type { OptionProps } from '../customSelect/CustomSelect'
import styles from './CustomOptions.module.css'

interface CustomOptionsProps {
    options: OptionProps<'id'>[]
    onSelect: (option: OptionProps<'id'>) => void
    searched?: boolean
}


const CustomOptions = ({ options, onSelect, searched }: CustomOptionsProps) => {
    return (
        <ul className={styles.optionsContainer}>
            {
                options.length > 0 ? (  
                    options.map((option) => (
                    <li className={styles.customOption} onClick={() => onSelect(option)}>{option.title}</li>
                    ))
                ) : searched ? (
                    <li className={styles.customOption}>Nenhum resultado encontrado</li>
                ) : null
            }
        </ul>
    )
}

export default CustomOptions