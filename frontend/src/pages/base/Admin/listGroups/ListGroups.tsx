import { useEffect, useState } from 'react'
import styles from './ListGroups.module.css'
import GroupService from '../../../../services/groupService'
import FormContainer from '../../../../components/formContainer/FormContainer'
import SearchBar from '../../../../components/searchBar/SearchBar'
import CustomLoading from '../../../../components/customLoading/CustomLoading'
import Table from '../../../../components/table/Table'

const ListGroups = () => {
    const [searchParam, setSearchParam] = useState<string>('')
    const [groups, setGroups] = useState([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [previousPage, setPreviousPage] = useState<number | null>(null)
    const [nextPage, setNextPage] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const fetchGroups = async () => {
        try {
            const res = await GroupService.list(currentPage)

            setGroups(res.data.results)
            
            if (res.data.next) setNextPage((prev) => prev = currentPage + 1)
            if (currentPage > 1) setPreviousPage((prev) => prev = currentPage - 1)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchGroups()
    }, [currentPage])


    return (
        <FormContainer title={`Gerenciar Grupos`}>
            <div>
                
            </div>
            <div className={styles.searchContainer}>
                <SearchBar
                    onChange={(e) => setSearchParam(e.target.value)}
                    onSearch={() => fetchGroups()}
                    searchParam={searchParam}
                />
            </div>
            {
                isLoading ? (
                    <CustomLoading />
                ) : groups.length > 0 ? (
                    <Table 
                        itemList={groups} 
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
                    <p className={styles.message}>Não há resultados para serem mostrados</p>
                )
            }
        </FormContainer>
    )
}

export default ListGroups