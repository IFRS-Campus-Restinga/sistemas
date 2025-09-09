import styles from './CustomOptions.module.css'

export type OptionProps<Key extends string = 'title'> = {
  id: string
  extraField?: string
} & {
  [K in Key]: string
}

interface CustomOptionsProps<Key extends string> {
  options: OptionProps<Key>[]
  renderKey: Key
  onSelect: (option: OptionProps<Key>) => void
  searched?: boolean
}

const CustomOptions = <Key extends string>({
  options,
  renderKey,
  onSelect,
  searched,
}: CustomOptionsProps<Key>) => {
  return (
    <ul className={styles.optionsContainer}>
      {options.length > 0 ? (
        options.map((option) => (
          <li
            key={option.id}
            onClick={() => onSelect(option)}
            className={styles.customOption}
          >
            {option[renderKey]}
          </li>
        ))
      ) : searched ? (
        <li className={styles.customOption}>Nenhum resultado encontrado</li>
      ) : null}
    </ul>
  )
}

export default CustomOptions