import styles from './LoginGroupList.module.css'
import visitor from '../../assets/user-svgrepo-com.svg'
import student from '../../assets/user-graduate-svgrepo-com.svg'
import employee from '../../assets/user-suit-svgrepo-com.svg'
import check from '../../assets/check-circle-svgrepo-com.svg'

interface LoginGroupListProps {
    loginGroup: 'aluno' | 'servidor' | 'convidado'
    changeLoginGroup: (group: 'aluno' | 'servidor' | 'convidado') => void
}

const LoginGroupList = ({ changeLoginGroup, loginGroup }: LoginGroupListProps) => {

    return (
        <div className={styles.div}>
            <ul className={styles.ul}>
                <li className={loginGroup === 'aluno' ? styles.liSelected : styles.li}
                    onClick={() => changeLoginGroup('aluno')}>
                    <div className={styles.divLi}>
                        <span className={styles.span}>
                            <img className={styles.img} src={student} alt="aluno" />
                            <h2 className={styles.h2}>Aluno</h2>
                        </span>
                        {
                            loginGroup === 'aluno' ? (
                                <img className={styles.img} src={check} alt="marcado" />
                            ) : null
                        }
                    </div>
                    <p className={styles.p}>Selecione este grupo de acesso caso seja aluno da instituição</p>
                </li>
                <li className={loginGroup === 'servidor' ? styles.liSelected : styles.li}
                    onClick={() => changeLoginGroup('servidor')}>
                    <div className={styles.divLi}>
                        <span className={styles.span}>
                            <img className={styles.img} src={employee} alt="servidor" />
                            <h2 className={styles.h2}>Servidor</h2>
                        </span>
                        {
                            loginGroup === 'servidor' ? (
                                <img className={styles.img} src={check} alt="marcado" />
                            ) : null
                        }
                    </div>
                    <p className={styles.p}>Selecione este grupo de acesso caso seja servidor de qualquer área da instituição</p>
                </li>
                <li className={loginGroup === 'convidado' ? styles.liSelected : styles.li}
                    onClick={() => changeLoginGroup('convidado')}>
                    <div className={styles.divLi}>
                        <span className={styles.span}>
                            <img className={styles.img} src={visitor} alt="convidado" />
                            <h2 className={styles.h2}>Convidado</h2>
                        </span>
                        {
                            loginGroup === 'convidado' ? (
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