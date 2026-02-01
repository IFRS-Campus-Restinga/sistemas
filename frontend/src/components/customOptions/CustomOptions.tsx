import styles from './CustomOptions.module.css'

export type OptionProps<Key extends string = 'title', Extra extends object = {}> = {
  id: string
  extraField?: string
} & {
  [K in Key]: string
} & Extra

interface CustomOptionsProps<Key extends string, Extra extends object = {}> {
  options: OptionProps<Key, Extra>[]
  renderKey: Key
  onSelect: (option: OptionProps<Key, Extra>) => void
  searched?: boolean
}

const CustomOptions = <Key extends string, Extra extends object = {}>({
  options,
  renderKey,
  onSelect,
  searched,
}: CustomOptionsProps<Key, Extra>) => {
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
