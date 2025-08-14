import styles from './CustomSearch.module.css'
import clear from '../../assets/close-svgrepo-com.svg'
import search from '../../assets/search-alt-svgrepo-com.svg'

interface CustomSearchProps {
    value: string
    setSearch: (param: string) => void
    onSearch: () => void
    showClear?: boolean
}

const CustomSearch = ({value, setSearch, onSearch, showClear}: CustomSearchProps) => {

    return (
        <div className={styles.customSearchContainer}>
            <input
                type='text'
                value={value}
                onChange={(e) => {setSearch(e.target.value)}}
                className={styles.searchInput}
                onKeyDown={(e) => e.key === 'Enter' ? onSearch() : null}
            />
            <span className={styles.actionsContainer}>
                <img src={search} alt="" className={styles.action} onClick={() => onSearch()}/>
                {
                    showClear ? (
                        <img src={clear} alt="" className={styles.action} onClick={() => setSearch('')}/>
                    ) : null
                }
            </span>
        </div>
    )
}

export default CustomSearch