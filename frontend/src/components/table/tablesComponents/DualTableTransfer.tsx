import styles from '../Table.module.css'
import doubleArrow from '../../../assets/double-arrow-right-svgrepo-com.svg'
import { useEffect, useRef } from 'react'
import CustomLoading from '../../customLoading/CustomLoading'

interface DualTableTransferProps<T> {
    title1: string
    title2: string
    list1: T[]
    list2: T[]
    setList1: React.Dispatch<React.SetStateAction<T[]>>
    setList2: React.Dispatch<React.SetStateAction<T[]>>
    callbackList1?: (item: T) => void
    callbackList2?: (item: T) => void
    currentList1: number
    currentList2?: number
    setCurrentList1: React.Dispatch<React.SetStateAction<number>>
    setCurrentList2?: React.Dispatch<React.SetStateAction<number>>
    prevList1: number | null
    prevList2?: number | null
    nextList1: number | null
    nextList2?: number | null
    renderItem: (item: T) => React.ReactNode
    getKey: (item: T) => string | number
    fetchData1: (page: number) => void
    fetchData2?: (page: number) => void
    loadingList1: boolean
    loadingList2?: boolean
    validate?: (item: T, targetList: T[]) => string | null
}

const DualTableTransfer = <T,>({ 
    title1, 
    title2, 
    list1, 
    list2, 
    setList1, 
    setList2,
    callbackList1,
    callbackList2,
    getKey, 
    renderItem,
    currentList1,
    currentList2,
    setCurrentList1,
    setCurrentList2,
    nextList1,
    nextList2,
    fetchData1,
    fetchData2,
    loadingList1,
    loadingList2,
    validate
}: DualTableTransferProps<T>) => {
    const firstRefList1 = useRef(null)
    const lastRefList1 = useRef(null)
    const firstRefList2 = useRef(null)
    const lastRefList2 = useRef(null)

    const sendToList2 = (itemIndex: number) => {
        const item = list1[itemIndex];

        if (validate) {
            const error = validate(item, list2);
            if (error) {
                console.log(error)
                return;
            }
        }

        const updatedList1 = list1.filter((_, index) => index !== itemIndex);

        const alreadyInList2 = list2.some((i) => getKey(i) === getKey(item));
        if (!alreadyInList2) {
            const updatedList2 = [...list2, item];
            setList2(updatedList2);
        }

        setList1(updatedList1);

        if (callbackList1) callbackList1(item);
    };

    const sendToList1 = (itemIndex: number) => {
        const item = list2[itemIndex];

        // Remover da list2
        const updatedList2 = list2.filter((_, index) => index !== itemIndex);

        // Verificar se item já está em list1
        const alreadyInList1 = list1.some((i) => getKey(i) === getKey(item));
        if (!alreadyInList1) {
            const updatedList1 = [...list1, item];
            setList1(updatedList1);
        }

        setList2(updatedList2); // Isso deve vir **depois**
        if (callbackList2) callbackList2(item)
    };

    // useffect para controlar paginação da tabela 1 através do scroll
    useEffect(() => {
        if (!lastRefList1.current) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
            if (entry.isIntersecting && nextList1 && !loadingList1) {
                setCurrentList1(prev => prev + 1);
            }
            });
        }, { threshold: 1.0 });

        observer.observe(lastRefList1.current);

        return () => {
            observer.disconnect();
        };
    }, [list1, nextList1, loadingList1]);

    useEffect(() => {
        if (currentList1 > 1) fetchData1(currentList1);
    }, [currentList1]);

    // useffect para controlar a paginação da tabela 2 através do scroll
    useEffect(() => {
        if (!lastRefList2.current) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
            if (entry.isIntersecting && nextList2 && !loadingList2 && setCurrentList2) {
                setCurrentList2(prev => prev + 1);
            }
            });
        }, { threshold: 1.0 });

        observer.observe(lastRefList2.current);

        return () => observer.disconnect();
    }, [list2, nextList2, loadingList2]);

    useEffect(() => {
        if (currentList2 && currentList2 > 1 && fetchData2) fetchData2(currentList2);
    }, [currentList2]);

    return (
        <section className={styles.tablesContainer}>
            <div className={styles.dualTableContainer}>
                {
                    loadingList1 ? (
                        <div className={styles.loadingWindow}>
                            <CustomLoading/>
                        </div>
                    ) : null
                }
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr className={styles.tr}>
                            <th className={styles.th}>{title1}</th>
                            <th className={styles.thDualAction}/>
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {list1.map((item, index) => (
                            <tr
                                className={styles.tr}
                                key={`list1-${getKey(item)}`}
                                ref={
                                    index === 0 ? firstRefList1 :
                                    index === list1.length - 1 ? lastRefList1 :
                                    null
                                }
                            >
                                <td className={styles.td}>{renderItem(item)}</td>
                                <td className={styles.tdDualAction}>
                                    <img src={doubleArrow} alt="Vincular" className={styles.action} onClick={() => sendToList2(index)}/>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className={styles.dualTableContainer}>
                {
                    loadingList2 ? (
                        <div className={styles.loadingWindow}>
                            <CustomLoading/>
                        </div>
                    ) : null
                }
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr className={styles.tr}>
                            <th className={styles.thDualAction}/>
                            <th className={styles.th}>{title2}</th>
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {list2.map((item, index) => (
                            <tr
                                className={styles.tr}
                                key={`list2-${getKey(item)}`}
                                ref={
                                    index === 0 ? firstRefList2 :
                                    index === list2.length - 1 ? lastRefList2 :
                                    null
                                }
                            >
                                <td className={styles.tdDualAction}>
                                    <img src={doubleArrow} alt="Desvincular" style={{rotate: '180deg'}} className={styles.action} onClick={() => sendToList1(index)}/>
                                </td>
                                <td className={styles.td}>{renderItem(item)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export default DualTableTransfer