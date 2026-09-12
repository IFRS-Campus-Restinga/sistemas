import { useEffect, useState } from "react"
import FormContainer from "../../components/formContainer/FormContainer"
import SearchBar from "../../components/searchBar/SearchBar"
import Table from "../../components/table/tablesComponents/Table"
import styles from './ListPage.module.css'
import { useNavigate } from "react-router-dom"
import Modal from "../../components/modal/Modal"
import CustomButton from "../../components/customButton/CustomButton"

const PPC_DRAFT_KEY = 'ppcDraft'

interface ListPageProps {
    title: string
    fetchData: (currentPage: number, searchParam: string) => Promise<{ next: number, previous: number, data: Record<string, any>[] }>
    registerUrl?: string
    canEdit: boolean
    canView: boolean
    translations: Record<string, string>
    onEdit?: (itemId: string) => void
}


const ListPage = ({ title, fetchData, registerUrl, canEdit, canView, translations, onEdit }: ListPageProps) => {
    const navigate = useNavigate()
    const [listData, setListData] = useState<Record<string, any>[]>([])
    const [searchParam, setSearchParam] = useState<string>('')
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [nextPage, setNextPage] = useState<number | null>(null)
    const [previousPage, setPreviousPage] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [showDraftModal, setShowDraftModal] = useState<boolean>(false)

    const openDraftDecision = () => {
        const hasDraft = !!localStorage.getItem(PPC_DRAFT_KEY)

        if (!hasDraft) {
            navigate(registerUrl ?? '/')
            return
        }

        setShowDraftModal(true)
    }

    const handleResumeDraft = () => {
        localStorage.removeItem(PPC_DRAFT_KEY)
        navigate(registerUrl ?? '/')
    }

    const handleClearDraft = () => {
        localStorage.removeItem(PPC_DRAFT_KEY)
        setShowDraftModal(false)
        navigate(registerUrl ?? '/')
    }
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
                        <div className={styles.addIcon} onClick={openDraftDecision}>+</div>
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
                        onEdit,
                    }}
                    searchParam={searchParam}
                    translations={translations}
                />
                {showDraftModal && (
                    <Modal setIsOpen={(open) => {
                        if (!open) setShowDraftModal(false)
                    }}>
                        <FormContainer title='Rascunho de PPC encontrado' width='35%'>
                            <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#767676' }}>
                                Há um cadastro de PPC em andamento. Você quer retomar o progresso ou apagar esse rascunho?
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                <CustomButton type='button' text='Retomar' onClick={() => {
                                    setShowDraftModal(false)
                                    navigate(registerUrl ?? '/')
                                }}/>
                                <CustomButton type='button' text='Apagar' variant='gray' onClick={() => {
                                    handleClearDraft()
                                }}/>
                            </div>
                        </FormContainer>
                    </Modal>
                )}
        </FormContainer>
    )
}

export default ListPage
