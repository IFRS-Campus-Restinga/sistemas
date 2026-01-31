import { Link } from 'react-router-dom'
import styles from './Dropdown.module.css'
import { useEffect, useRef, useState } from 'react'

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
    const closeTimerRef = useRef<number | null>(null)

    const clearCloseTimer = () => {
        if (closeTimerRef.current !== null) {
            window.clearTimeout(closeTimerRef.current)
            closeTimerRef.current = null
        }
    }

    const handleOpen = () => {
        clearCloseTimer()
        setDropdownOpen(true)
    }

    const handleClose = () => {
        clearCloseTimer()
        closeTimerRef.current = window.setTimeout(() => {
            setDropdownOpen(false)
            closeTimerRef.current = null
        }, 500)
    }

    useEffect(() => {
        return () => {
            clearCloseTimer()
        }
    }, [])

    return (
        <div className={styles.dropdownContainer} onMouseEnter={handleOpen} onMouseLeave={handleClose}>
            <h1 className={styles.dropdownTitle}>
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
                    <ul className={styles.dropdownList} style={{backgroundColor: backgroundColor}}>
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
