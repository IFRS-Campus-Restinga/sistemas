import styles from './DualTableTransfer.module.css'
import doubleArrow from '../../assets/double-arrow-right-svgrepo-com.svg'

interface DualTableTransferProps<T> {
    title1: string
    title2: string
    list1: T[]
    list2: T[]
    setList1: (list: T[]) => void
    setList2: (list: T[]) => void
    renderItem: (item: T) => React.ReactNode
    getKey: (item: T) => string | number
}

const DualTableTransfer = <T,>({ title1, title2, list1, list2, setList1, setList2, getKey, renderItem }: DualTableTransferProps<T>) => {
    
    const sendToList2 = (itemIndex: number) => {
        const item = list1[itemIndex]

        setList1(list1.filter((_, index) => index !== itemIndex))

        setList2([...list2, item])
    }

    const sendToList1 = (itemIndex: number) => {
        const item = list2[itemIndex]

        setList2(list2.filter((_, index) => index !== itemIndex))

        setList1([...list1, item])
    }

        return (
        <section className={styles.tablesContainer}>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr className={styles.tr}>
                            <th className={styles.th}>{title1}</th>
                            <th className={styles.th}/>
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {list1.map((item, index) => (
                            <tr className={styles.tr} key={getKey(item)}>
                                <td className={styles.td}>{renderItem(item)}</td>
                                <td className={styles.td}>
                                    <img src={doubleArrow} alt="Vincular" className={styles.action} onClick={() => sendToList2(index)}/>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr className={styles.tr}>
                            <th className={styles.th}/>
                            <th className={styles.th}>{title2}</th>
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {list2.map((item, index) => (
                            <tr className={styles.tr} key={getKey(item)}>
                                <td className={styles.td}>
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