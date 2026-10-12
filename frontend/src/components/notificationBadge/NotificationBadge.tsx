import styles from './NotificationBadge.module.css'

interface NotificationBadgeProps {
    count: number
}

const NotificationBadge = ({ count }: NotificationBadgeProps) => (
    <span className={styles.badge} aria-label={`${count} solicitações pendentes`}>
        {count}
    </span>
)

export default NotificationBadge
