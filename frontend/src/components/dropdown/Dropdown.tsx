import { Link } from 'react-router-dom'
import styles from './Dropdown.module.css'
import { useState } from 'react'

interface DropdownItemProps {
    title: string
    link?: string
    icon?: string
    onClick?: () => void
}

export interface DropdownProps {
    dropdownTitle?: string
    dropdownIcon?: string
    items: DropdownItemProps[]
    dropdownChildren?: React.ReactNode
}

const Dropdown = ({ items, dropdownIcon, dropdownTitle, dropdownChildren }: DropdownProps) => {
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)

    const changeDropdownState = () => {
        if (dropdownOpen) {
            setTimeout(() => {
                setDropdownOpen((prev) => !prev)
            }, 300);
        } else {
            setDropdownOpen((prev) => !prev)
        }
    }

    return (
        <div className={styles.dropdownContainer}>
            <h1 className={styles.dropdownTitle} onMouseEnter={changeDropdownState}>
                {
                    dropdownIcon && dropdownTitle ? (
                        <>
                            <img className={styles.dropdownIcon} src={dropdownIcon} alt={dropdownTitle} />
                            {dropdownTitle}
                        </>
                    ) : dropdownChildren ? (
                        dropdownChildren
                    ) : (
                        null
                    )
                }
            </h1>
            {
                dropdownOpen ? (
                    <ul className={styles.dropdownList} onMouseLeave={changeDropdownState}>
                        {
                            items.map((item) => (
                                item.link ? (
                                    <Link to={item.link} className={styles.dropdownItem}>
                                        <li>
                                            {item.title}
                                        </li>
                                    </Link>
                                ) : (
                                    <li className={styles.dropdownItem} onClick={item.onClick}>
                                        {item.title}
                                    </li>
                                )
                            ))
                        }
                    </ul>
                ) : null
            }
        </div>
    )
}

export default Dropdown