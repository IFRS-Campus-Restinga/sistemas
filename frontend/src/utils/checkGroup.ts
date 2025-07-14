export const checkGroup = (groups: string[]) => {
    if (groups.includes('admin')) return 'admin'
    if (groups.includes('membro')) return 'membro'
    if (groups.includes('convidado')) return 'convidado'
}