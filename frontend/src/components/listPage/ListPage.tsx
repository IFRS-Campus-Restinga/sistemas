import { useEffect, useState } from "react"
import CustomLoading from "../customLoading/CustomLoading"
import FormContainer from "../formContainer/FormContainer"
import SearchBar from "../searchBar/SearchBar"
import Table from "../table/Table"
import styles from './ListPage.module.css'

interface ListPageProps {
    title: string
    fetchData: (currentPage: number, searchParam: string) => Promise<{ next: number, previous: number, data: Record<string, any>[] }>
}


const ListPage = ({ title, fetchData }: ListPageProps) => {
    const [data, setData] = useState<Record<any, string>[]>([])
    const [searchParam, setSearchParam] = useState<string>('')
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [nextPage, setNextPage] = useState<number | null>(null)
    const [previousPage, setPreviousPage] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const handleSearch = async () => {
        setIsLoading(true)
        try {
            const { next, previous, data } = await fetchData(currentPage, searchParam)

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
        handleSearch()
    }, [currentPage, title])

    useEffect(() => {
        if (searchParam === '') handleSearch()
    }, [searchParam])

    return (
        <FormContainer title={`Gerenciar ${title}`}>
            <div className={styles.searchContainer}>
                <SearchBar
                    setSearch={setSearchParam}
                    onSearch={() => handleSearch()}
                    searchParam={searchParam}
                />
            </div>
            {
                isLoading ? (
                    <CustomLoading />
                ) : data.length > 0 ? (
                    <Table 
                        itemList={data} 
                        next={nextPage} 
                        previous={previousPage} 
                        current={currentPage} 
                        setCurrent={setCurrentPage} 
                        loadingContent={isLoading} 
                        canDelete={true}    
                        canEdit={true}    
                        canView={true}    
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