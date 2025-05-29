import { Link } from 'react-router-dom';
import styles from './HomeAdmin.module.css'

const HomeAdmin = () => {

    const handleRedirect = (url: string) => {
        const token = sessionStorage.getItem('access');
        if (!token) return;

        const encodedToken = encodeURIComponent(token);
        window.location.href = `${url}/login?token=${encodedToken}`;
    };

    return (
        <section className={styles.section}>
            <h2 className={styles.h2}>Bem vindo ADM</h2>
            <Link to={'/admin/sistemas/cadastro'}>Adicionar novo sistema</Link>
            <button className={styles.button} onClick={() => handleRedirect('http://127.0.0.1:3000')}>Ir Para sistema de Dependências</button>
        </section>
    )
}

export default HomeAdmin