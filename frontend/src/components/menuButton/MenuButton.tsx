import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import styles from './MenuButton.module.css'

interface MenuButtonProps {
    to: string
    icon: string
    label: string
    alt: string
    iconScale?: number
}

const MenuButton = ({ to, icon, label, alt, iconScale = 1 }: MenuButtonProps) => (
    <Link to={to} className={styles.menuButton}>
        <img
            src={icon}
            alt={alt}
            className={styles.menuIcon}
            style={{ '--menu-icon-scale': iconScale } as CSSProperties}
        />
        {label}
    </Link>
)

export default MenuButton