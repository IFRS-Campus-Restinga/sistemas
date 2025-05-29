import styles from './CustomSelect.module.css'

export interface OptionProps {
    title: string
    value: string
}

interface CustomSelectProps {
    options: OptionProps[]
    value: string
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    onBlur?: () => void
}

const CustomSelect = ({ options, value, onChange, onBlur }: CustomSelectProps) => {

    return (
        <select className={styles.select} value={value} onChange={onChange} onBlur={onBlur}>
            {
                options.map((option) => (
                    <option className={styles.option} value={option.value}>{option.title}</option>
                ))
            }
        </select>
    )
}

export default CustomSelect