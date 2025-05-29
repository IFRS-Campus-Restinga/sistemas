import { Link } from 'react-router-dom'
import styles from './Dropdown.module.css'
import { useState } from 'react'

interface DropdownItemProps {
    title: string
    link: string
    icon?: string
}

export interface DropdownProps {
    dropdownTitle: string
    dropdownIcon: string
    items: DropdownItemProps[]
}

const Dropdown = ({ items, dropdownIcon, dropdownTitle }: DropdownProps) => {
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
                <img className={styles.dropdownIcon} src={dropdownIcon} alt={dropdownTitle} />
                {dropdownTitle}
            </h1>
            {
                dropdownOpen ? (
                    <ul className={styles.dropdownList} onMouseLeave={changeDropdownState}>
                        {
                            items.map((item) => (
                                <li className={styles.dropdownItem}>
                                    <Link to={item.link} className={styles.itemTitle}>
                                        {item.title}
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
                ) : null
            }
        </div>
    )
}

export default Dropdown