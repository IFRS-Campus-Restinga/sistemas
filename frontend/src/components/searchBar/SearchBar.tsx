import styles from './SearchBar.module.css'

interface SearchBarProps {
    searchParam: string
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    onSearch: (param: string) => void
}

const SearchBar = ({ onSearch, onChange, searchParam }: SearchBarProps) => {

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            onSearch(searchParam)
        }
    }

    return (
        <div className={styles.searchBarContainer}>
            <input
                type="text"
                value={searchParam}
                onChange={onChange}
                onKeyDown={handleKeyDown}
            />
            <div className={styles.actionsContainer}>
                <img src="" alt="Buscar" onClick={() => onSearch(searchParam)} />
                <img src="" alt="Outro botão" />
            </div>
        </div>
    )
}

export default SearchBar
