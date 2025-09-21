export const checkGroup = (groups: string[]) => {
    if (groups.includes('admin')) return 'admin'
    if (groups.includes('user')) return 'user'
}