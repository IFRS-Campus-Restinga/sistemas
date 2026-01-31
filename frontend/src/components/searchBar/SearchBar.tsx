import styles from './SearchBar.module.css'
import search from '../../assets/search-alt-svgrepo-com-white.svg'
import clear from '../../assets/close-svgrepo-com-white.svg'

interface SearchBarProps {
    searchParam: string
    setSearch: React.Dispatch<React.SetStateAction<string>>
    onSearch: (page: number, param: string) => void
}

const SearchBar = ({ onSearch, setSearch, searchParam }: SearchBarProps) => {

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && searchParam.length > 0) {
            onSearch(1, searchParam)
        }
    }

    const handleSearch = () => {
        if (searchParam.length > 0) onSearch(1, searchParam)
    }

    const handleClear = () => {
        setSearch('')
    }

    return (
        <div className={styles.searchBarContainer}>
            <input
                type="text"
                name="searchInput"
                value={searchParam}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className={styles.searchInput}
            />

            <div className={styles.actionsContainer}>
                <img
                    src={search}
                    className={styles.action}
                    alt="Buscar"
                    onClick={handleSearch}
                />
                <img
                    src={clear}
                    className={styles.action}
                    alt="Limpar campo"
                    onClick={handleClear}
                />
            </div>
        </div>
    )
}

export default SearchBar
