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
    backgroundColor?: string
    backgroundColor2?: string
    color?: string
}

const Dropdown = ({ items, dropdownIcon, dropdownTitle, backgroundColor, backgroundColor2, color, dropdownChildren }: DropdownProps) => {
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
                    dropdownTitle ? (
                        dropdownIcon ? (
                            <>
                                <img className={styles.dropdownIcon} src={dropdownIcon} alt={dropdownTitle} />
                                {dropdownTitle}
                            </>
                        ) : (
                            dropdownTitle
                        )
                    ) : dropdownIcon ? (
                        <img className={styles.dropdownIcon} src={dropdownIcon} />
                    ) : dropdownChildren ? (
                        dropdownChildren
                    ) : null
                }
            </h1>
            {
                dropdownOpen ? (
                    <ul className={styles.dropdownList} style={{backgroundColor: backgroundColor}} onMouseLeave={changeDropdownState}>
                        {
                            items.map((item) =>
                                item.link ? (
                                <Link
                                    to={item.link}
                                    className={styles.dropdownItem}
                                    style={{ color: color, '--hover-bg': backgroundColor2 } as React.CSSProperties}
                                    key={item.title}
                                >
                                    <li>{item.title}</li>
                                </Link>
                                ) : (
                                <li
                                    className={styles.dropdownItem}
                                    onClick={item.onClick}
                                    style={{ color: color, '--hover-bg': backgroundColor2 } as React.CSSProperties}
                                    key={item.title}
                                >
                                    {item.title}
                                </li>
                                )
                            )
                        }
                    </ul>
                ) : null
            }
        </div>
    )
}

export default Dropdown