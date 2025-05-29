import type { DropdownProps } from '../dropdown/Dropdown'
import Dropdown from '../dropdown/Dropdown'
import styles from './CustomNavBar.module.css'

interface CustomNavBarProps {
    navBarItems: DropdownProps[]
}

const CustomNavBar = ({ navBarItems }: CustomNavBarProps) => {

    return (
        <nav className={styles.navBar}>
            {
                navBarItems.map((item) => (
                    <Dropdown dropdownIcon={item.dropdownIcon} dropdownTitle={item.dropdownTitle} items={item.items} />
                ))
            }
        </nav>
    )
}

export default CustomNavBar