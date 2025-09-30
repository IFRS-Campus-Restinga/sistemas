import { useEffect, useState } from 'react'
import UserService from '../../../../services/userService'
import { useUser } from '../../../../store/userHooks'
import styles from './Profile.module.css'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import CustomLoading from '../../../../components/customLoading/CustomLoading'

interface ProfileInterface {
    email: string
    registration: string
    cpf: string
    telephone_number: string
    birth_date: string
}

const Profile = () => {
    const user = useUser()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [profileData, setProfileData] = useState<ProfileInterface>({
        birth_date: '',
        cpf: '',
        email: '',
        registration: '',
        telephone_number: ''
    })

    const fetchProfile = async () => {
        try {
            const res = await UserService.get(user.id!, 'email, additional_infos.registration, additional_infos.cpf, additional_infos.telephone_number, additional_infos.birth_date')

            setProfileData({
                birth_date: res.data.additional_infos.birth_date,
                cpf: res.data.additional_infos.cpf,
                email: res.data.email,
                registration: res.data.additional_infos.registration,
                telephone_number: res.data.additional_infos.telephone_number
            })
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message)
            } else {
                console.error(error)
            }
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() =>{
        fetchProfile()
    }, [])

    return (
        <section className={styles.section}>
            {
                isLoading ? (
                    <CustomLoading/>
                ) : (
                    <>
                        <img src={sessionStorage.getItem("profilePicture")!} alt="" className={styles.profilePicture} />
                        <label className={styles.label}>
                            Nome De usuário
                            <h2 className={styles.h2}>
                                {user.username}
                            </h2>
                        </label>
                        <label className={styles.label}>
                            Email
                            <h2 className={styles.h2}>
                                {profileData.email}
                            </h2>
                        </label>
                        <div className={styles.profileContainer}>
                            <div className={styles.sectionGroup}>
                                <label className={styles.label}>
                                    Perfil
                                    <p className={styles.p}>
                                        {user.access_profile}
                                    </p>
                                </label>
                                <label className={styles.label}>
                                    CPF
                                    <p className={styles.p}>
                                        {profileData.cpf}
                                    </p>
                                </label>
                            </div>
                            <div className={styles.sectionGroup}>
                                <label className={styles.label}>
                                    Contato
                                    <p className={styles.p}>
                                        {profileData.telephone_number}
                                    </p>
                                </label>
                                <label className={styles.label}>
                                    Data de nascimento
                                    <p className={styles.p}>
                                        {new Date(profileData.birth_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                                    </p>
                                </label>
                            </div>
                        </div>
                        {
                            profileData.registration ? (
                                <label className={styles.label}>
                                    Matrícula
                                    <p className={styles.p}>
                                        {profileData.registration}
                                    </p>
                                </label>
                            ) : null
                        }
                    </>
                )
            }
        </section>
    )
}

export default Profile