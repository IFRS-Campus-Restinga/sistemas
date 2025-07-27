import styles from './CustomSelect.module.css'

export type OptionProps<Key extends string = 'value'> = {
  title: string
  extraField?: string
} & {
  [K in Key]: string
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