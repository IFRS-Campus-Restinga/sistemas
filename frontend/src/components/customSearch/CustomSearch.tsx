import { useEffect, useRef } from 'react'
import styles from './CustomSearch.module.css'
import clear from '../../assets/close-svgrepo-com.svg'
import search from '../../assets/search-alt-svgrepo-com.svg'

const IGNORE_OPTION_SELECTOR = '[data-custom-option="true"]'

interface CustomSearchProps {
    value: string
    setSearch: (param: string) => void
    onSearch: () => void
    onBlur?: () => void
    showClear?: boolean
}

const CustomSearch = ({value, setSearch, onSearch, onBlur, showClear}: CustomSearchProps) => {
    const searchRef = useRef<HTMLDivElement | null>(null)
    const ignoreBlurRef = useRef(false)

    useEffect(() => {
        if (!onBlur) return

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target

            if (target instanceof Element && target.closest(IGNORE_OPTION_SELECTOR)) {
                ignoreBlurRef.current = true
                return
            }

            if (searchRef.current && !searchRef.current.contains(target as Node)) {
                onBlur()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [onBlur])

    return (
        <div className={styles.customSearchContainer} ref={searchRef}>
            <input
                type='text'
                value={value}
                onChange={(e) => {setSearch(e.target.value)}}
                className={styles.searchInput}
                onBlur={(event) => {
                    if (ignoreBlurRef.current) {
                        ignoreBlurRef.current = false
                        event.preventDefault()
                        return
                    }

                    onBlur?.()
                }}
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