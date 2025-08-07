import type { DropdownProps } from '../dropdown/Dropdown'
import Dropdown from '../dropdown/Dropdown'
import styles from './CustomNavBar.module.css'

interface CustomNavBarProps {
    navBarItems: DropdownProps[]
    backgroundColor?: string
    backgroundColor2?: string
    color?: string
}

const CustomNavBar = ({ navBarItems, backgroundColor, backgroundColor2, color }: CustomNavBarProps) => {

    return (
        <nav className={styles.navBar}>
            {
                navBarItems.map((item) => (
                    <Dropdown backgroundColor={backgroundColor} backgroundColor2={backgroundColor2} color={color} dropdownIcon={item.dropdownIcon} dropdownTitle={item.dropdownTitle} items={item.items} />
                ))
            }
        </nav>
    )
}

export default CustomNavBar