import { useState } from 'react'
import type { OptionProps } from '../customOptions/CustomOptions'
import styles from './CustomSelect.module.css'
import arrowDown from '../../assets/chevron-down-svgrepo-com.svg'

// Opção alternativa usada pelo select
type ValueOption = { value: string; title: string; extraField?: string }

// Interface do select aceita OptionProps<Key> OU ValueOption
interface CustomSelectProps<Key extends 'title' | 'username' | 'name'> {
  options: (OptionProps<Key> | ValueOption)[]
  onSelect: (option: OptionProps<Key> | ValueOption) => void
  onBlur?: () => void
  renderKey: Key | 'title'
  selected: OptionProps<Key> | ValueOption | null
  disabled?: boolean
}

const CustomSelect = <Key extends 'title' | 'username' | 'name'>({
  options,
  onSelect,
  selected,
  renderKey,
  disabled = false,
}: CustomSelectProps<Key>) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className={`${styles.selectContainer} ${disabled ? styles.disabled : ''}`}
      onClick={() => {
        if (!disabled) setIsOpen((prev) => !prev)
      }}
    >
      <span className={styles.span}>
        <p className={styles.p}>
            {
                selected
                    ? 'id' in selected
                    ? // OptionProps<Key>
                        renderKey in selected
                        ? selected[renderKey as Key]
                        : '' // fallback caso a chave não exista
                    : selected.title // ValueOption
                    : 'Selecione uma opção'
            }
        </p>
        <img
          className={`${styles.icon} ${isOpen ? styles.iconUp : styles.iconDown}`}
          src={arrowDown}
          alt=""
          onClick={(e) => {
            e.stopPropagation()
            if (!disabled) setIsOpen((prev) => !prev)
          }}
        />
      </span>

      {isOpen && !disabled && (
        <ul className={styles.options}>
          {options.length > 0
            ? options.map((option) => (
                <li
                  key={'id' in option ? option.id : option.value} 
                  className={styles.option}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(option)
                    setIsOpen(false)
                  }}
                >
                    {
                        'id' in option
                        ? renderKey in option
                        ? option[renderKey as Key]
                        : ''
                        : option.title
                    }
                </li>
              ))
            : null}
        </ul>
      )}
    </div>
  )
}

export default CustomSelect
