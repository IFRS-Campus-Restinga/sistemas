import { useState } from 'react'
import ListPage from '../../../../features/listPage/ListPage'
import PPCService from '../../../../services/ppcService'
import Modal from '../../../../components/modal/Modal'
import FormContainer from '../../../../components/formContainer/FormContainer'
import CustomButton from '../../../../components/customButton/CustomButton'
import { useNavigate } from 'react-router-dom'

const PPC_EDIT_DRAFT_KEY = 'ppcEditDraft'

const translations = {
    "id": "id",
    "title": "título",
    "course": "curso",
    "created_at": "data de criação"
}

const PPCList = () => {
    const navigate = useNavigate()
    const [showEditDraftModal, setShowEditDraftModal] = useState<boolean>(false)
    const [pendingPPCId, setPendingPPCId] = useState<string | null>(null)

    const fetchPPCs = async (page: number = 1, searchParam: string) => {
        const res = await PPCService.list(page, searchParam, 'id, title, course.name, created_at')

        return {
            next: res.data.next,
            previous: res.data.previous,
            data: res.data.results
        }
    }

    const handleEditPPC = (ppcId: string) => {
        const draftString = localStorage.getItem(PPC_EDIT_DRAFT_KEY)

        if (!draftString) {
            navigate(`/session/admin/ppcs/${ppcId}/edit/`, { state: ppcId })
            return
        }

        try {
            const draft = JSON.parse(draftString)

            if (draft.ppcId && draft.ppcId !== ppcId) {
                setPendingPPCId(ppcId)
                setShowEditDraftModal(true)
                return
            }
        } catch (error) {
            console.error(error)
        }

        navigate(`/session/admin/ppcs/${ppcId}/edit/`, { state: ppcId })
    }

    const resumeEditDraft = () => {
        const draftString = localStorage.getItem(PPC_EDIT_DRAFT_KEY)

        if (!draftString) return

        try {
            const draft = JSON.parse(draftString)
            if (draft.ppcId) {
                setShowEditDraftModal(false)
                navigate(`/session/admin/ppcs/${draft.ppcId}/edit/`, { state: draft.ppcId })
            }
        } catch (error) {
            console.error(error)
        }
    }

    const discardEditDraftAndOpen = () => {
        localStorage.removeItem(PPC_EDIT_DRAFT_KEY)
        setShowEditDraftModal(false)

        if (pendingPPCId) {
            navigate(`/session/admin/ppcs/${pendingPPCId}/edit/`, { state: pendingPPCId })
        }
    }

    return (
        <>
            <ListPage
                title={'Projeto Pedag. de Curso (PPC)'}
                fetchData={fetchPPCs}
                registerUrl='/session/admin/ppcs/create/'
                canEdit={true}
                canView={true}
                translations={translations}
                onEdit={handleEditPPC}
            />

            {showEditDraftModal && (
                <Modal setIsOpen={(open) => {
                    if (!open) setShowEditDraftModal(false)
                }}>
                    <FormContainer title='Rascunho de edição encontrado' width='35%'>
                        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#767676' }}>
                            Já existe um PPC em edição com progresso salvo. Selecionar outro para edição vai apagar esse rascunho.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <CustomButton type='button' text='Recuperar progresso' onClick={resumeEditDraft} />
                            <CustomButton type='button' text='Continuar com este' variant='gray' onClick={discardEditDraftAndOpen} />
                        </div>
                    </FormContainer>
                </Modal>
            )}
        </>
    )
}

export default PPCList
