import { useEffect, useState } from "react"
import CustomLoading from '../../components/customLoading/CustomLoading'
import FormContainer from "../../components/formContainer/FormContainer"
import SearchBar from "../../components/searchBar/SearchBar"
import Table from "../../components/table/tablesComponents/Table"
import styles from './ListPage.module.css'
import { useNavigate } from "react-router-dom"

interface ListPageProps {
    title: string
    fetchData: (currentPage: number, searchParam: string) => Promise<{ next: number, previous: number, data: Record<string, any>[] }>
    registerUrl: string
    canEdit: boolean
    canView: boolean
    onDelete: (id: string) => void
}


const ListPage = ({ title, fetchData, registerUrl, canEdit, canView, onDelete }: ListPageProps) => {
    const navigate = useNavigate()
    const [data, setData] = useState<Record<any, string>[]>([])
    const [searchParam, setSearchParam] = useState<string>('')
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [nextPage, setNextPage] = useState<number | null>(null)
    const [previousPage, setPreviousPage] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const handleSearch = async (page: number, param: string) => {
        setIsLoading(true)

        try {
            const { next, previous, data } = await fetchData(page, param)

            setData(data)

            if (next) setNextPage(currentPage + 1)
            if (previous) setPreviousPage(currentPage - 1)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        handleSearch(currentPage, searchParam)
    }, [title])

    useEffect(() => {
        if (searchParam === '') handleSearch(currentPage, searchParam)
    }, [searchParam])

    return (
        <FormContainer title={`Gerenciar ${title}`}>
            <div className={styles.searchContainer}>
                <SearchBar
                    setSearch={setSearchParam}
                    onSearch={(page, param) => {
                        setCurrentPage(page)
                        handleSearch(page, param)
                    }}
                    searchParam={searchParam}
                />
                <div className={styles.addIcon} onClick={() => navigate(registerUrl)}>+</div>
            </div>
            {
                isLoading ? (
                    <CustomLoading />
                ) : data.length > 0 ? (
                    <Table 
                        itemList={data}
                        fetchData={handleSearch} 
                        next={nextPage} 
                        previous={previousPage} 
                        current={currentPage} 
                        setCurrent={setCurrentPage} 
                        loadingContent={isLoading} 
                        crudActions={{
                            canEdit: canEdit,
                            canView: canView,
                            onDelete: onDelete
                        }}
                        searchParam={searchParam}
                    />
                ) : (
                    <div className={styles.messageContainer}>
                        <p className={styles.message}>Não há resultados para serem mostrados</p>
                    </div>
                )
            }
        </FormContainer>
    )
}

export default ListPage