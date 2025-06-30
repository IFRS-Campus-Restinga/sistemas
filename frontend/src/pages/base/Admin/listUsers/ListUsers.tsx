import { useLocation } from 'react-router-dom'
import FormContainer from '../../../../components/formContainer/FormContainer'
import styles from './ListUsers.module.css'
import SearchBar from '../../../../components/searchBar/SearchBar'
import { useEffect, useState } from 'react'
import UserService from '../../../../services/userService'
import Table from '../../../../components/table/Table'
import CustomLoading from '../../../../components/customLoading/CustomLoading'

const ListUsers = () => {
    const location = useLocation()
    const group = location.pathname.split('/')[2]

    const [searchParam, setSearchParam] = useState<string>('')
    const [users, setUsers] = useState<any[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [nextPage, setNextPage] = useState<number | null>(null)
    const [previousPage, setPreviousPage] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const fetchUsers = async (page: number = 1) => {
        try {
            const res = await UserService.searchOrListUsers(group, searchParam, page, 'list')
            if (res.status !== 200) throw new Error(res.data.message)

            setUsers(res.data.results)
            if (res.data.next) setNextPage((prev) => prev = currentPage + 1)
            if (currentPage > 1) setPreviousPage((prev) => prev = currentPage - 1)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [group, currentPage])

    return (
        <FormContainer title={`Gerenciar ${group.toUpperCase()}`}>
            <div className={styles.searchContainer}>
                <SearchBar
                    onChange={(e) => setSearchParam(e.target.value)}
                    onSearch={() => fetchUsers(currentPage)}
                    searchParam={searchParam}
                />
            </div>
            {
                isLoading ? (
                    <CustomLoading />
                ) : users.length > 0 ? (
                    <Table 
                        itemList={users} 
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

export default ListUsers
