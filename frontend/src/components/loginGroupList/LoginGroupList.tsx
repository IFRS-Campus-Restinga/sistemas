import styles from './LoginGroupList.module.css'
import visitor from '../../assets/user-svgrepo-com.svg'
import student from '../../assets/user-graduate-svgrepo-com.svg'
import employee from '../../assets/user-suit-svgrepo-com.svg'
import check from '../../assets/check-circle-svgrepo-com.svg'

interface LoginGroupListProps {
    loginGroup: 'Aluno' | 'Servidor' | 'Convidado'
    changeLoginGroup: (group: 'Aluno' | 'Servidor' | 'Convidado') => void
}

const LoginGroupList = ({ changeLoginGroup, loginGroup }: LoginGroupListProps) => {

    return (
        <div className={styles.div}>
            <ul className={styles.ul}>
                <li className={loginGroup === 'Aluno' ? styles.liSelected : styles.li}
                    onClick={() => changeLoginGroup('Aluno')}>
                    <div className={styles.divLi}>
                        <span className={styles.span}>
                            <img className={styles.img} src={student} alt="Aluno" />
                            <h2 className={styles.h2}>Aluno</h2>
                        </span>
                        {
                            loginGroup === 'Aluno' ? (
                                <img className={styles.img} src={check} alt="marcado" />
                            ) : null
                        }
                    </div>
                    <p className={styles.p}>Selecione este grupo de acesso caso seja aluno da instituição</p>
                </li>
                <li className={loginGroup === 'Servidor' ? styles.liSelected : styles.li}
                    onClick={() => changeLoginGroup('Servidor')}>
                    <div className={styles.divLi}>
                        <span className={styles.span}>
                            <img className={styles.img} src={employee} alt="Servidor" />
                            <h2 className={styles.h2}>Servidor</h2>
                        </span>
                        {
                            loginGroup === 'Servidor' ? (
                                <img className={styles.img} src={check} alt="marcado" />
                            ) : null
                        }
                    </div>
                    <p className={styles.p}>Selecione este grupo de acesso caso seja servidor de qualquer área da instituição</p>
                </li>
                <li className={loginGroup === 'Convidado' ? styles.liSelected : styles.li}
                    onClick={() => changeLoginGroup('Convidado')}>
                    <div className={styles.divLi}>
                        <span className={styles.span}>
                            <img className={styles.img} src={visitor} alt="Convidado" />
                            <h2 className={styles.h2}>Convidado</h2>
                        </span>
                        {
                            loginGroup === 'Convidado' ? (
                                <img className={styles.img} src={check} alt="marcado" />
                            ) : null
                        }
                    </div>
                    <p className={styles.p}>Selecione este grupo de acesso caso não seja membro da instituição</p>
                </li>
            </ul>
        </div>
    )
}

export default LoginGroupList