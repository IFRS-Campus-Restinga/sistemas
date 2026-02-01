import { useEffect, useState } from "react"
import FormContainer from "../../components/formContainer/FormContainer"
import SearchBar from "../../components/searchBar/SearchBar"
import Table from "../../components/table/tablesComponents/Table"
import styles from './ListPage.module.css'
import { useNavigate } from "react-router-dom"

interface ListPageProps {
    title: string
    fetchData: (currentPage: number, searchParam: string) => Promise<{ next: number, previous: number, data: Record<string, any>[] }>
    registerUrl?: string
    canEdit: boolean
    canView: boolean
    translations: Record<string, string>
}


const ListPage = ({ title, fetchData, registerUrl, canEdit, canView, translations }: ListPageProps) => {
    const navigate = useNavigate()
    const [listData, setListData] = useState<Record<string, any>[]>([])
    const [searchParam, setSearchParam] = useState<string>('')
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [nextPage, setNextPage] = useState<number | null>(null)
    const [previousPage, setPreviousPage] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const handleSearch = async (page: number, param: string) => {
        setIsLoading(true)

        try {
            const { next, previous, data } = await fetchData(page, param)

            setListData(page > 1 ? [...listData, ...data] : [...data])

            if (next) setNextPage(page + 1)
            if (previous) setPreviousPage(page - 1)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        handleSearch(currentPage, searchParam)
    }, [currentPage])

    useEffect(() => {
        if (searchParam === '') handleSearch(1, searchParam)
    }, [searchParam])

    return (
        <FormContainer title={`Gerenciar ${title}`}>
            <div className={styles.searchContainer}>
                <SearchBar
                    setSearch={setSearchParam}
                    onSearch={(page, param) => {
                        if (param === '') setListData([])
                        setCurrentPage(page)
                        setNextPage(null)
                        setPreviousPage(null)
                        setSearchParam(param)
                        handleSearch(1, param)
                    }}
                    searchParam={searchParam}
                />
                {
                    registerUrl ? (
                        <div className={styles.addIcon} onClick={() => navigate(registerUrl)}>+</div>
                    ) : null
                }
            </div>
                <Table 
                    itemList={listData}
                    fetchData={handleSearch}
                    next={nextPage}
                    previous={previousPage}
                    current={currentPage}
                    setCurrent={setCurrentPage} 
                    loadingContent={isLoading} 
                    crudActions={{
                        canEdit: canEdit,
                        canView: canView,
                    }}
                    searchParam={searchParam}
                    translations={translations}
                />
        </FormContainer>
    )
}

export default ListPage
