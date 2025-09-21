import styles from '../Table.module.css'
import X from '../../../assets/close-svgrepo-com.svg'
import CustomInput from '../../customInput/CustomInput'

interface DynamicTableProps {
    items: string[]
    itemTitle: string
    parentIndex?: number
    ParentRemoveItem?: (parentIndex:number, itemIndex: number) => void
    ParentSetItem?: (parentIndex: number, itemIndex: number, value: string) => void
    setItems?: (items: string[]) => void
    useSelect?: Boolean
    errors?: Array<string | null>
}

const DynamicTable = ({ items, itemTitle, ParentRemoveItem, ParentSetItem, parentIndex, setItems, errors }: DynamicTableProps) => {
    const removeItem = (itemIndex: number) => {
        if (setItems) {
            const newItems = items.filter((_, index) => index !== itemIndex)
            setItems(newItems)
        }
    }

    const addItem = () => {
        if (setItems) {
            setItems([...items, ''])
        }
    }

    const setItem = (itemIndex: number, itemValue: string) => {       
        const newItems = [...items]
        newItems[itemIndex] = itemValue
        if (setItems) setItems(newItems)
    }

    return (
        <div className={styles.dynamicTableContainer}>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr>
                            <th className={styles.th}>
                                <p className={styles.tableTitle}>
                                    {itemTitle}
                                </p>
                            </th>
                            <th className={styles.thDynamicAction}/>
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {
                            items.length > 0 ? (
                                items.map((item, index) => (
                                    <tr className={styles.tr} key={index}>
                                        <td className={styles.td}>                                            
                                            <CustomInput
                                                value={item}
                                                onChange={
                                                    ParentSetItem ? 
                                                    (e) => ParentSetItem(parentIndex!, index, e.target.value) 
                                                    :
                                                    (e) => setItem(index, e.target.value)
        
                                                }
                                                error={errors && errors[index] ? errors[index] : null}
                                                type='text'
                                            />
                                        </td>
                                        <td className={styles.tdDynamicAction}>
                                            <img 
                                                src={X} 
                                                className={styles.remove} 
                                                alt="remover" 
                                                onClick={
                                                    parentIndex !== undefined && ParentRemoveItem !== undefined ? 
                                                    () => ParentRemoveItem(parentIndex, index) 
                                                    : () => removeItem(index)}/>
                                        </td>
                                    </tr>
                                ))
                            ) : null
                        }
                    </tbody>
                </table>
            </div>
            {
                !ParentRemoveItem && !ParentSetItem ? (
                    <button className={styles.addButton} type='button' onClick={() => addItem()}>+</button>
                ) : null
            }
        </div>
    );
};

export default DynamicTable